'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Pencil, Trash2, Megaphone, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
import {
  Btn,
  Card,
  EmptyState,
  Loading,
  Modal,
  SectionHeader,
  StatusBadge,
  Table,
  Td,
  TextArea,
  TextField,
  Th,
  useToast,
  fmtDate,
  CheckRow,
} from '../lib';

type Promo = Doc<'promotions'>;

type PromoForm = {
  name: string;
  description: string;
  discountPercent: string;
  promoCode: string;
  maxUsesPerUser: string;
  bannerText: string;
  active: boolean;
  startDate: string;
  endDate: string;
};

function emptyForm(): PromoForm {
  return {
    name: '',
    description: '',
    discountPercent: '',
    promoCode: '',
    maxUsesPerUser: '1',
    bannerText: '',
    active: true,
    startDate: '',
    endDate: '',
  };
}

function fromPromo(p: Promo): PromoForm {
  return {
    name: p.name,
    description: p.description,
    discountPercent: String(p.discountPercent),
    promoCode: p.promoCode ?? '',
    maxUsesPerUser: p.maxUsesPerUser ? String(p.maxUsesPerUser) : '1',
    bannerText: p.bannerText ?? '',
    active: p.active,
    startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 10) : '',
    endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 10) : '',
  };
}

export default function Promotions() {
  const promos = useQuery(api.promotions.listAll, {});
  const upsert = useMutation(api.promotions.upsert);
  const del = useMutation(api.promotions.remove);
  const toggle = useMutation(api.promotions.setActive);
  const toast = useToast();

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Promo | null>(null);
  const [form, setForm] = useState<PromoForm>(emptyForm());
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setForm(emptyForm());
    setEditing(null);
    setCreating(true);
  }
  function openEdit(p: Promo) {
    setForm(fromPromo(p));
    setEditing(p);
    setCreating(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast('Promotion name is required', 'error');
      return;
    }
    const pct = parseFloat(form.discountPercent || '0');
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      toast('Discount must be 0–100%', 'error');
      return;
    }
    setSaving(true);
    try {
      await upsert({
        id: editing?._id,
        name: form.name.trim(),
        description: form.description.trim(),
        discountPercent: pct,
        promoCode: form.promoCode.trim() || undefined,
        maxUsesPerUser: form.maxUsesPerUser ? parseInt(form.maxUsesPerUser, 10) : undefined,
        bannerText: form.bannerText.trim() || undefined,
        active: form.active,
        startDate: form.startDate ? new Date(form.startDate).getTime() : undefined,
        endDate: form.endDate ? new Date(form.endDate).getTime() : undefined,
      });
      toast(editing ? 'Promotion updated' : 'Promotion created');
      setCreating(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(p: Promo) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await del({ id: p._id });
      toast('Promotion deleted');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  async function toggleActive(p: Promo) {
    try {
      await toggle({ id: p._id, active: !p.active });
      toast(p.active ? 'Promotion paused' : 'Promotion activated');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Toggle failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Sales & Promotions"
        subtitle="Store-wide discounts that apply to all items. Active promotions show in the announcement banner."
        actions={
          <Btn variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New promotion
          </Btn>
        }
      />

      <Card className="p-1.5">
        {promos === undefined ? (
          <Loading />
        ) : promos.length === 0 ? (
          <EmptyState message="No promotions yet - create your first one." />
        ) : (
          <Table
            head={
              <>
                <Th>Promotion</Th>
                <Th>Discount</Th>
                <Th>Banner Text</Th>
                <Th>Dates</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {promos.map((p) => (
              <tr key={p._id} className="hover:bg-black/[0.015]">
                <Td>
                  <div>
                    <div className="font-semibold text-text-primary">{p.name}</div>
                    {p.description && (
                      <div className="text-[12px] text-text-secondary line-clamp-1">
                        {p.description}
                      </div>
                    )}
                  </div>
                </Td>
                <Td>
                  <span className="font-semibold text-lume-accent">{p.discountPercent}%</span>
                </Td>
                <Td>
                  <span className="text-[12px] text-text-secondary line-clamp-1">
                    {p.bannerText || '-'}
                  </span>
                </Td>
                <Td>
                  <span className="text-[12px] text-text-secondary">
                    {p.startDate ? fmtDate(p.startDate) : '-'} →{' '}
                    {p.endDate ? fmtDate(p.endDate) : 'Ongoing'}
                  </span>
                </Td>
                <Td>
                  <button onClick={() => toggleActive(p)} title="Toggle active">
                    <StatusBadge status={p.active ? 'active' : 'paused'} />
                  </button>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => confirmDelete(p)}
                      className="rounded-lg p-2 text-text-secondary hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={editing ? `Edit ${editing.name}` : 'New promotion'}
        footer={
          <>
            <Btn onClick={() => setCreating(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create promotion'}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Promotion Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Valentine's Day Sale"
          />
          <TextField
            label="Discount (%)"
            type="number"
            step="0.5"
            min="0"
            max="100"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            placeholder="e.g. 10"
          />
          <TextField
            label="Promo Code"
            value={form.promoCode}
            onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
            placeholder="e.g. LUMEFIRST"
          />
          <TextField
            label="Max uses per customer"
            type="number"
            min="1"
            value={form.maxUsesPerUser}
            onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
            placeholder="e.g. 1"
          />
          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. 10% off all items for Valentine's Day"
            />
          </div>
          <div className="sm:col-span-2">
            <TextField
              label="Banner Text (shown in the scrolling bar)"
              value={form.bannerText}
              onChange={(e) => setForm({ ...form, bannerText: e.target.value })}
              placeholder="e.g. Valentine's Day Sale - 10% off everything!"
            />
            <p className="mt-1.5 text-[12px] text-text-secondary">
              This text scrolls in the green announcement bar at the top of the site.
            </p>
          </div>
          <TextField
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <TextField
            label="End Date"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <div className="sm:col-span-2 border-t border-black/[0.06] pt-4">
            <CheckRow
              label="Active (applies discount & shows in banner)"
              checked={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
