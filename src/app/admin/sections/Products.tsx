'use client';

import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc } from '../../../../convex/_generated/dataModel';
import {
  Btn,
  Card,
  CheckRow,
  EmptyState,
  Loading,
  Modal,
  SectionHeader,
  SelectField,
  StatusBadge,
  Table,
  Td,
  TextArea,
  TextField,
  Th,
  cents,
  useAction,
  useToast,
} from '../lib';

type Product = Doc<'products'>;

const UNITS = ['ea', 'lb', 'oz', 'kg', 'g', 'L', 'ml', 'pkg', 'pack'];
const ATTR_KEYS = [
  'organic',
  'local',
  'glutenFree',
  'dairyFree',
  'vegan',
  'nutFree',
] as const;

type FormState = {
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  priceDollars: string;
  imageUrl: string;
  tags: string;
  purchaseType: string;
  active: boolean;
  attributes: Record<string, boolean>;
};

function emptyForm(): FormState {
  return {
    sku: '',
    name: '',
    description: '',
    category: '',
    unit: 'ea',
    priceDollars: '',
    imageUrl: '',
    tags: '',
    purchaseType: 'one-time',
    active: true,
    attributes: {},
  };
}

function fromProduct(p: Product): FormState {
  return {
    sku: p.sku,
    name: p.name,
    description: p.description ?? '',
    category: p.category,
    unit: p.unit,
    priceDollars: (p.basePriceCents / 100).toFixed(2),
    imageUrl: p.imageUrl ?? '',
    tags: (p.tags ?? []).join(', '),
    purchaseType: p.purchaseType ?? 'one-time',
    active: p.active,
    attributes: { ...(p.attributes ?? {}) } as Record<string, boolean>,
  };
}

export default function Products() {
  const products = useQuery(api.admin.listProducts, {});
  const upsert = useMutation(api.products.upsertProduct);
  const setActive = useMutation(api.admin.setProductActive);
  const del = useMutation(api.admin.deleteProduct);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);

  const toggleActive = useAction(
    (p: Product) => setActive({ productId: p._id, active: !p.active }),
    'Product updated'
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    (products ?? []).forEach((p) => set.add(p.category));
    return [...set].sort();
  }, [products]);

  const filtered = useMemo(() => {
    return (products ?? []).filter((p) => {
      if (category && p.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, search, category]);

  function openCreate() {
    setForm(emptyForm());
    setEditing(null);
    setCreating(true);
  }
  function openEdit(p: Product) {
    setForm(fromProduct(p));
    setEditing(p);
    setCreating(true);
  }

  async function save() {
    if (!form.sku.trim() || !form.name.trim() || !form.category.trim()) {
      toast('SKU, name, and category are required', 'error');
      return;
    }
    const priceCents = Math.round(parseFloat(form.priceDollars || '0') * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      toast('Enter a valid price', 'error');
      return;
    }
    const attributes: Record<string, boolean> = {};
    for (const k of ATTR_KEYS) if (form.attributes[k]) attributes[k] = true;

    setSaving(true);
    try {
      await upsert({
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category.trim(),
        unit: form.unit,
        basePriceCents: priceCents,
        imageUrl: form.imageUrl.trim() || undefined,
        attributes: Object.keys(attributes).length ? attributes : undefined,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : undefined,
        purchaseType: form.purchaseType,
        active: form.active,
      });
      toast(editing ? 'Product updated' : 'Product created');
      setCreating(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await del({ productId: p._id });
      toast('Product deleted');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  }

  return (
    <div>
      <SectionHeader
        title="Products"
        subtitle="Your full catalogue — create, edit, activate, or remove items."
        actions={
          <Btn variant="primary" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New product
          </Btn>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, SKU, category…"
            className="w-full rounded-lg border border-black/[0.1] bg-white py-2 pl-9 pr-3 text-[14px] outline-none focus:border-lume-accent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-black/[0.1] bg-white px-3 py-2 text-[14px] outline-none focus:border-lume-accent"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-[13px] text-text-secondary">
          {filtered.length} item{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      <Card className="p-1.5">
        {products === undefined ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState message="No products match." />
        ) : (
          <Table
            head={
              <>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-black/[0.015]">
                <Td>
                  <div className="font-semibold text-text-primary">{p.name}</div>
                  <div className="text-[12px] text-text-secondary">
                    {p.unit}
                    {p.tags && p.tags.length > 0 && ` · ${p.tags.join(', ')}`}
                  </div>
                </Td>
                <Td className="font-mono text-[12px] text-text-secondary">
                  {p.sku}
                </Td>
                <Td className="capitalize">{p.category}</Td>
                <Td className="text-right tabular-nums">
                  {cents(p.basePriceCents)}
                </Td>
                <Td>
                  <button onClick={() => toggleActive(p)} title="Toggle active">
                    <StatusBadge status={p.active ? 'active' : 'draft'} />
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
        title={editing ? `Edit ${editing.name}` : 'New product'}
        wide
        footer={
          <>
            <Btn onClick={() => setCreating(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </Btn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="SKU"
            value={form.sku}
            disabled={!!editing}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="e.g. PROD-001"
          />
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Organic Brown Rice"
          />
          <TextField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. pantry"
          />
          <SelectField
            label="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </SelectField>
          <TextField
            label="Price (USD)"
            type="number"
            step="0.01"
            min="0"
            value={form.priceDollars}
            onChange={(e) => setForm({ ...form, priceDollars: e.target.value })}
            placeholder="0.00"
          />
          <SelectField
            label="Purchase type"
            value={form.purchaseType}
            onChange={(e) => setForm({ ...form, purchaseType: e.target.value })}
          >
            <option value="one-time">One-time</option>
            <option value="subscription">Subscription</option>
          </SelectField>
          <div className="sm:col-span-2">
            <TextField
              label="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div className="sm:col-span-2">
            <TextField
              label="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Sale, New, Best Seller"
            />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
              Attributes
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ATTR_KEYS.map((k) => (
                <CheckRow
                  key={k}
                  label={k}
                  checked={!!form.attributes[k]}
                  onChange={(v) =>
                    setForm({
                      ...form,
                      attributes: { ...form.attributes, [k]: v },
                    })
                  }
                />
              ))}
            </div>
          </div>
          <div className="sm:col-span-2 border-t border-black/[0.06] pt-4">
            <CheckRow
              label="Active (visible in shop)"
              checked={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
