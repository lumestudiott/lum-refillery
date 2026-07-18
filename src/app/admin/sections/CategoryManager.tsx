'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Pencil, Trash2, Boxes } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
import { PRODUCT_UNITS, UNIT_LABELS } from '@/data/productCategories';
import {
  Btn,
  CheckRow,
  EmptyState,
  Label,
  Loading,
  Modal,
  SelectField,
  TextArea,
  TextField,
  useToast,
} from '../lib';

type Cat = Doc<'productCategories'>;

type CatForm = {
  code: string;
  label: string;
  description: string;
  attributeSet: string;
  units: string[];
  active: boolean;
};

function emptyForm(): CatForm {
  return {
    code: '',
    label: '',
    description: '',
    attributeSet: 'food',
    units: ['ea'],
    active: true,
  };
}

export default function CategoryManager({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const cats = useQuery(api.catalog.listCategories, open ? {} : 'skip');
  const upsert = useMutation(api.catalog.upsertCategory);
  const del = useMutation(api.catalog.deleteCategory);
  const toast = useToast();

  const [mode, setMode] = useState<'list' | 'edit'>('list');
  const [editing, setEditing] = useState<Cat | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm());
  const [customUnit, setCustomUnit] = useState('');
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setForm(emptyForm());
    setEditing(null);
    setMode('edit');
  }
  function openEdit(c: Cat) {
    setForm({
      code: c.code,
      label: c.label,
      description: c.description ?? '',
      attributeSet: c.attributeSet,
      units: [...c.units],
      active: c.active,
    });
    setEditing(c);
    setMode('edit');
  }
  function close() {
    setMode('list');
    onClose();
  }

  function toggleUnit(u: string) {
    setForm((f) => ({
      ...f,
      units: f.units.includes(u) ? f.units.filter((x) => x !== u) : [...f.units, u],
    }));
  }
  function addCustomUnit() {
    const u = customUnit.trim();
    if (!u) return;
    setForm((f) => (f.units.includes(u) ? f : { ...f, units: [...f.units, u] }));
    setCustomUnit('');
  }

  async function save() {
    if (!form.code.trim() || !form.label.trim()) {
      toast('Code and name are required', 'error');
      return;
    }
    if (form.units.length === 0) {
      toast('Pick at least one unit', 'error');
      return;
    }
    setSaving(true);
    try {
      await upsert({
        id: editing?._id,
        code: form.code,
        label: form.label,
        description: form.description || undefined,
        attributeSet: form.attributeSet,
        units: form.units,
        active: form.active,
      });
      toast(editing ? 'Category updated' : 'Category added');
      setMode('list');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Cat) {
    if (!confirm(`Delete "${c.label}"? This can't be undone.`)) return;
    try {
      await del({ id: c._id });
      toast('Category deleted');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  const masterUnits = Array.from(new Set([...PRODUCT_UNITS, ...form.units]));

  return (
    <Modal
      open={open}
      onClose={close}
      title={mode === 'edit' ? (editing ? `Edit ${editing.label}` : 'New category') : 'Manage categories'}
      wide
      footer={
        mode === 'edit' ? (
          <>
            <Btn onClick={() => setMode('list')}>Back</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add category'}
            </Btn>
          </>
        ) : (
          <>
            <Btn onClick={close}>Done</Btn>
            <Btn variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" /> New category
            </Btn>
          </>
        )
      }
    >
      {mode === 'list' ? (
        cats === undefined ? (
          <Loading />
        ) : cats.length === 0 ? (
          <EmptyState message="No categories yet - add your first one." />
        ) : (
          <div className="space-y-2">
            <p className="mb-3 text-[12px] text-text-secondary">
              Categories set the SKU prefix, which attribute checkboxes appear, and
              which units a product can use.
            </p>
            {cats.map((c) => (
              <div
                key={c._id}
                className="flex items-center gap-3 rounded-xl border border-black/[0.07] bg-[#FCF8EF]/60 px-4 py-3"
              >
                <span className="inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-lg bg-lume-accent/10 font-mono text-[13px] font-semibold text-lume-accent">
                  {c.code}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-text-primary">{c.label}</span>
                    {!c.active && (
                      <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-secondary">
                        Hidden
                      </span>
                    )}
                  </div>
                  <div className="truncate text-[12px] text-text-secondary">
                    {c.attributeSet === 'home' ? 'Home / retail' : 'Food / pantry'} ·{' '}
                    {c.units.join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => openEdit(c)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => remove(c)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="SKU code (2–3 letters) *"
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Za-z]/g, '') })
            }
            maxLength={3}
            placeholder="e.g. PC"
          />
          <TextField
            label="Name *"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="e.g. Personal Care"
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What belongs in this category?"
            />
          </div>
          <SelectField
            label="Attribute set"
            value={form.attributeSet}
            onChange={(e) => setForm({ ...form, attributeSet: e.target.value })}
          >
            <option value="food">Food / pantry (dietary labels)</option>
            <option value="home">Home / retail (eco & material labels)</option>
          </SelectField>
          <div className="flex items-end">
            <CheckRow
              label="Visible for new products"
              checked={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
            />
          </div>

          <div className="sm:col-span-2">
            <Label>Allowed units</Label>
            <div className="flex flex-wrap gap-1.5">
              {masterUnits.map((u) => {
                const active = form.units.includes(u);
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => toggleUnit(u)}
                    className={`rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
                      active
                        ? 'border-lume-accent bg-lume-accent/10 text-lume-accent'
                        : 'border-black/[0.12] bg-[#FCF8EF] text-text-secondary hover:border-lume-accent/40 hover:text-text-primary'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}
                    {u}
                    {UNIT_LABELS[u] ? ` · ${UNIT_LABELS[u]}` : ''}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomUnit();
                  }
                }}
                placeholder="Add a custom unit (e.g. box)"
                className="w-52 rounded-lg border border-black/[0.12] bg-[#FCF8EF] px-3 py-1.5 text-[13px] outline-none focus:border-lume-accent"
              />
              <Btn onClick={addCustomUnit}>Add unit</Btn>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
