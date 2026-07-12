'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import {
  Btn,
  Card,
  CheckRow,
  EmptyState,
  Loading,
  Modal,
  SectionHeader,
  TextField,
  useToast,
} from '../lib';

type SubCat = {
  _id: Id<'shopCategories'>;
  slug: string;
  label: string;
  parentId?: Id<'shopCategories'>;
  sortOrder: number;
  active: boolean;
  createdAt: number;
};

type ParentCat = SubCat & { subcategories: SubCat[] };

type CatForm = {
  label: string;
  slug: string;
  active: boolean;
};

function emptyForm(): CatForm {
  return { label: '', slug: '', active: true };
}

export default function ShopCategoryManager() {
  const cats = useQuery(api.shopCategories.listAll, {});
  const upsert = useMutation(api.shopCategories.upsert);
  const del = useMutation(api.shopCategories.remove);
  const seedCats = useMutation(api.shopCategories.ensureSeeded);
  const toast = useToast();

  const [editingParent, setEditingParent] = useState<ParentCat | null>(null);
  const [editingSub, setEditingSub] = useState<SubCat | null>(null);
  const [parentModal, setParentModal] = useState(false);
  const [subModal, setSubModal] = useState(false);
  const [subParentId, setSubParentId] = useState<Id<'shopCategories'> | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    seedCats().catch(() => {});
  }, [seedCats]);

  // Parent CRUD
  function openCreateParent() {
    setForm(emptyForm());
    setEditingParent(null);
    setParentModal(true);
  }
  function openEditParent(c: ParentCat) {
    setForm({ label: c.label, slug: c.slug, active: c.active });
    setEditingParent(c);
    setParentModal(true);
  }
  async function saveParent() {
    if (!form.label.trim()) {
      toast('Category name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await upsert({
        id: editingParent?._id,
        label: form.label.trim(),
        slug: form.slug.trim() || undefined,
        active: form.active,
      });
      toast(editingParent ? 'Category updated' : 'Category created');
      setParentModal(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Sub CRUD
  function openCreateSub(parentId: Id<'shopCategories'>) {
    setForm(emptyForm());
    setEditingSub(null);
    setSubParentId(parentId);
    setSubModal(true);
  }
  function openEditSub(sub: SubCat, parentId: Id<'shopCategories'>) {
    setForm({ label: sub.label, slug: sub.slug, active: sub.active });
    setEditingSub(sub);
    setSubParentId(parentId);
    setSubModal(true);
  }
  async function saveSub() {
    if (!form.label.trim() || !subParentId) {
      toast('Sub-category name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      await upsert({
        id: editingSub?._id,
        label: form.label.trim(),
        slug: form.slug.trim() || undefined,
        parentId: subParentId,
        active: form.active,
      });
      toast(editingSub ? 'Sub-category updated' : 'Sub-category created');
      setSubModal(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: Id<'shopCategories'>, label: string) {
    if (!confirm(`Delete "${label}"? Children will also be removed.`)) return;
    try {
      await del({ id });
      toast('Deleted');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Shop Categories"
        subtitle="Parent categories become navigation tabs in the shop. Sub-categories appear in the dropdown under each tab."
        actions={
          <Btn variant="primary" onClick={openCreateParent}>
            <Plus className="h-4 w-4" /> New parent category
          </Btn>
        }
      />

      {cats === undefined ? (
        <Loading />
      ) : cats.length === 0 ? (
        <EmptyState message="No shop categories yet — add your first one." />
      ) : (
        <div className="space-y-4">
          {cats.map((parent) => (
            <Card key={parent._id} className="overflow-hidden">
              {/* Parent row */}
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
                <span className="inline-flex h-9 min-w-[44px] shrink-0 items-center justify-center rounded-lg bg-lume-accent/10 px-2 font-display text-[14px] font-semibold text-lume-accent">
                  {parent.label}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-mono text-[12px] text-text-secondary">
                    /{parent.slug}
                  </span>
                  {!parent.active && (
                    <span className="ml-2 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                      Hidden
                    </span>
                  )}
                </div>
                <Btn onClick={() => openCreateSub(parent._id)}>
                  <Plus className="h-3.5 w-3.5" /> Sub
                </Btn>
                <button
                  onClick={() => openEditParent(parent)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => confirmDelete(parent._id, parent.label)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Sub-categories */}
              {parent.subcategories.length > 0 && (
                <div className="divide-y divide-black/[0.04] px-5">
                  {parent.subcategories.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center gap-3 py-3 pl-6"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-text-secondary" />
                      <span className="flex-1 text-[13px] text-text-primary">
                        {sub.label}
                      </span>
                      <span className="font-mono text-[11px] text-text-secondary">
                        /{sub.slug}
                      </span>
                      {!sub.active && (
                        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                          Hidden
                        </span>
                      )}
                      <button
                        onClick={() => openEditSub(sub, parent._id)}
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(sub._id, sub.label)}
                        className="rounded-lg p-1.5 text-text-secondary hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Parent modal */}
      <Modal
        open={parentModal}
        onClose={() => setParentModal(false)}
        title={editingParent ? `Edit ${editingParent.label}` : 'New parent category'}
        footer={
          <>
            <Btn onClick={() => setParentModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={saveParent} disabled={saving}>
              {saving ? 'Saving…' : editingParent ? 'Save changes' : 'Create'}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4">
          <TextField
            label="Name *"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. Household"
          />
          <TextField
            label="Slug (auto-generated if blank)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="e.g. household"
          />
          <CheckRow
            label="Active (visible in shop navigation)"
            checked={form.active}
            onChange={(v) => setForm({ ...form, active: v })}
          />
        </div>
      </Modal>

      {/* Sub modal */}
      <Modal
        open={subModal}
        onClose={() => setSubModal(false)}
        title={editingSub ? `Edit ${editingSub.label}` : 'New sub-category'}
        footer={
          <>
            <Btn onClick={() => setSubModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={saveSub} disabled={saving}>
              {saving ? 'Saving…' : editingSub ? 'Save changes' : 'Create'}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4">
          <TextField
            label="Name *"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. Weekly Hauls"
          />
          <TextField
            label="Slug (auto-generated if blank)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="e.g. weekly-hauls"
          />
          <CheckRow
            label="Active"
            checked={form.active}
            onChange={(v) => setForm({ ...form, active: v })}
          />
        </div>
      </Modal>
    </div>
  );
}
