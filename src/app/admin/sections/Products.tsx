'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import {
  Plus,
  Minus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Info,
  Tag,
  Image as ImageIcon,
  SlidersHorizontal,
  Boxes,
} from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc, Id } from '../../../../convex/_generated/dataModel';
import {
  PRODUCT_CATEGORIES,
  PURCHASE_TYPES,
  FOOD_ATTRIBUTES,
  HOME_ATTRIBUTES,
  ATTRIBUTE_LABELS,
  categoryLabel,
  isHomeCategory,
  unitsForCategory,
} from '@/data/productCategories';
import { stockStatus } from '@/lib/stock';
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

type TabId = 'general' | 'pricing' | 'inventory' | 'media' | 'attributes';

const TABS: { id: TabId; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', hint: 'Baseline info for every item.', icon: Info },
  { id: 'pricing', label: 'Pricing', hint: 'How it’s sold and measured.', icon: Tag },
  { id: 'inventory', label: 'Inventory', hint: 'Track stock and low-stock alerts.', icon: Boxes },
  { id: 'media', label: 'Media', hint: 'Photo and discovery tags.', icon: ImageIcon },
  {
    id: 'attributes',
    label: 'Attributes',
    hint: 'Diet or eco labels for filters.',
    icon: SlidersHorizontal,
  },
];

type FormState = {
  name: string;
  description: string;
  category: string;
  unit: string;
  priceDollars: string;
  depositDollars: string;
  trackInventory: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  imageUrl: string;
  tags: string;
  purchaseType: string;
  active: boolean;
  attributes: Record<string, boolean>;
};

function emptyForm(): FormState {
  return {
    name: '',
    description: '',
    category: '',
    unit: 'ea',
    priceDollars: '',
    depositDollars: '',
    trackInventory: false,
    stockQuantity: '',
    lowStockThreshold: '',
    imageUrl: '',
    tags: '',
    purchaseType: 'one-time',
    active: true,
    attributes: {},
  };
}

function fromProduct(p: Product): FormState {
  return {
    name: p.name,
    description: p.description ?? '',
    category: p.category,
    unit: p.unit,
    priceDollars: (p.basePriceCents / 100).toFixed(2),
    depositDollars: p.depositCents ? (p.depositCents / 100).toFixed(2) : '',
    trackInventory: p.trackInventory ?? false,
    stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : '',
    lowStockThreshold: p.lowStockThreshold != null ? String(p.lowStockThreshold) : '',
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
  const adjustStock = useMutation(api.products.adjustStock);
  const setStock = useMutation(api.products.setStock);
  const genUploadUrl = useMutation(api.products.generateUploadUrl);
  const getImageUrl = useMutation(api.products.getImageUrl);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState<TabId>('general');
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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
          categoryLabel(p.category).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, search, category]);

  function openCreate() {
    setForm(emptyForm());
    setEditing(null);
    setTab('general');
    setCreating(true);
  }
  function openEdit(p: Product) {
    setForm(fromProduct(p));
    setEditing(p);
    setTab('general');
    setCreating(true);
  }

  /** Changing category re-scopes the unit list; keep the unit valid. */
  function changeCategory(code: string) {
    setForm((f) => {
      const units = unitsForCategory(code);
      return { ...f, category: code, unit: units.includes(f.unit) ? f.unit : units[0] };
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await genUploadUrl();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = (await res.json()) as { storageId: string };
      const publicUrl = await getImageUrl({ storageId: storageId as Id<'_storage'> });
      if (publicUrl) setForm((f) => ({ ...f, imageUrl: publicUrl }));
      toast('Image uploaded');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!form.name.trim() || !form.category.trim()) {
      setTab('general');
      toast('Name and category are required', 'error');
      return;
    }
    const priceCents = Math.round(parseFloat(form.priceDollars || '0') * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setTab('pricing');
      toast('Enter a valid price', 'error');
      return;
    }

    const relevant = isHomeCategory(form.category) ? HOME_ATTRIBUTES : FOOD_ATTRIBUTES;
    const attributes: Record<string, boolean> = {};
    for (const k of relevant) if (form.attributes[k]) attributes[k] = true;

    const depositCents =
      form.purchaseType === 'deposit'
        ? Math.round(parseFloat(form.depositDollars || '0') * 100)
        : undefined;

    const trackInventory = form.trackInventory;
    const stockQuantity = trackInventory
      ? Math.max(0, Math.round(parseFloat(form.stockQuantity || '0')))
      : undefined;
    const lowStockThreshold =
      trackInventory && form.lowStockThreshold.trim()
        ? Math.max(0, Math.round(parseFloat(form.lowStockThreshold)))
        : undefined;

    setSaving(true);
    try {
      await upsert({
        sku: editing ? editing.sku : undefined, // undefined → auto-generated
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        unit: form.unit,
        basePriceCents: priceCents,
        trackInventory,
        stockQuantity,
        lowStockThreshold,
        depositCents,
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

  async function adjust(p: Product, delta: number) {
    try {
      await adjustStock({ productId: p._id, delta });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update stock', 'error');
    }
  }
  async function setQty(p: Product, quantity: number) {
    try {
      await setStock({ productId: p._id, stockQuantity: quantity });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not update stock', 'error');
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

  const isHome = isHomeCategory(form.category);
  const attrKeys = isHome ? HOME_ATTRIBUTES : FOOD_ATTRIBUTES;
  const units = unitsForCategory(form.category);
  const activeTab = TABS.find((t) => t.id === tab);

  return (
    <div>
      <SectionHeader
        title="Products"
        subtitle="Your full catalogue — SKUs are auto-generated per category."
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
            className="w-full rounded-lg border border-black/[0.1] bg-[#FCF8EF] py-2 pl-9 pr-3 text-[14px] outline-none focus:border-lume-accent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-black/[0.1] bg-[#FCF8EF] px-3 py-2 text-[14px] outline-none focus:border-lume-accent"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
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
                <Th>Stock</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </>
            }
          >
            {filtered.map((p) => (
              <tr key={p._id} className="hover:bg-black/[0.015]">
                <Td>
                  <div className="flex items-center gap-3">
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-lg border border-black/10 object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-text-primary">{p.name}</div>
                      <div className="text-[12px] text-text-secondary">
                        {p.unit}
                        {p.tags && p.tags.length > 0 && ` · ${p.tags.join(', ')}`}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-[12px] text-text-secondary">{p.sku}</Td>
                <Td>{categoryLabel(p.category)}</Td>
                <Td className="text-right tabular-nums">{cents(p.basePriceCents)}</Td>
                <Td>
                  <StockCell
                    product={p}
                    onAdjust={(d) => adjust(p, d)}
                    onSet={(q) => setQty(p, q)}
                  />
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
        {/* Tab bar */}
        <div className="flex gap-1 rounded-2xl border border-[#E6DBC4] bg-[#F4ECDB]/50 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-colors ${
                  tab === t.id
                    ? 'bg-canvas text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mb-5 mt-2.5 text-[12px] text-text-secondary">{activeTab?.hint}</p>

        {/* ── General ── */}
        {tab === 'general' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Organic Brown Rice"
            />
            <TextField
              label="SKU (auto-generated)"
              value={editing ? editing.sku : ''}
              disabled
              placeholder="Assigned automatically on save"
            />
            <div className="sm:col-span-2">
              <SelectField
                label="Category *"
                value={form.category}
                onChange={(e) => changeCategory(e.target.value)}
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="sm:col-span-2">
              <TextArea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Sourcing & flavour notes for food, or material & care for retail."
              />
            </div>
            <div className="sm:col-span-2 border-t border-black/[0.06] pt-4">
              <CheckRow
                label="Active (visible in shop)"
                checked={form.active}
                onChange={(v) => setForm({ ...form, active: v })}
              />
            </div>
          </div>
        )}

        {/* ── Pricing & fulfillment ── */}
        {tab === 'pricing' && (
          <div className="grid gap-4 sm:grid-cols-2">
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
              label={form.category ? `Unit (${categoryLabel(form.category)})` : 'Unit'}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </SelectField>
            <div className={form.purchaseType === 'deposit' ? undefined : 'sm:col-span-2'}>
              <SelectField
                label="Purchase type"
                value={form.purchaseType}
                onChange={(e) => setForm({ ...form, purchaseType: e.target.value })}
              >
                {PURCHASE_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </SelectField>
            </div>
            {form.purchaseType === 'deposit' && (
              <TextField
                label="Deposit (USD, refundable)"
                type="number"
                step="0.01"
                min="0"
                value={form.depositDollars}
                onChange={(e) => setForm({ ...form, depositDollars: e.target.value })}
                placeholder="0.00"
              />
            )}
          </div>
        )}

        {/* ── Inventory ── */}
        {tab === 'inventory' && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-[#E6DBC4] bg-[#FCF8EF]/60 p-4">
              <CheckRow
                label="Track quantity for this item"
                checked={form.trackInventory}
                onChange={(v) => setForm({ ...form, trackInventory: v })}
              />
              <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
                When on, the shop shows remaining stock, warns at low levels, and
                stops selling once it hits zero. Leave off for made-to-order or
                fresh items you always keep available.
              </p>
            </div>
            {form.trackInventory && (
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Quantity on hand"
                  type="number"
                  min="0"
                  step="1"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                  placeholder="0"
                />
                <TextField
                  label="Low-stock alert at"
                  type="number"
                  min="0"
                  step="1"
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm({ ...form, lowStockThreshold: e.target.value })
                  }
                  placeholder="5"
                />
              </div>
            )}
          </div>
        )}

        {/* ── Media & discovery ── */}
        {tab === 'media' && (
          <div className="grid gap-4">
            <div>
              <TextField
                label="Image"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="Paste a URL, or upload below"
              />
              <div className="mt-2 flex items-center gap-3">
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="h-12 w-12 rounded-lg border border-black/10 object-cover"
                  />
                )}
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/[0.12] bg-[#FCF8EF] px-3.5 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:border-lume-accent/40">
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={onFile}
                  />
                </label>
              </div>
            </div>
            <TextField
              label="Tags (comma-separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="Zero Waste, Pantry Staple, Best Seller"
            />
          </div>
        )}

        {/* ── Dynamic attributes ── */}
        {tab === 'attributes' && (
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
              {isHome ? 'Home & retail attributes' : 'Food & pantry attributes'}
            </div>
            <p className="mb-3 text-[12px] text-text-secondary">
              {form.category
                ? isHome
                  ? 'Eco & material labels for Home & Kitchen items.'
                  : 'Dietary labels — shown as shop filters.'
                : 'Pick a category first; the label set changes for Home & Kitchen.'}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {attrKeys.map((k) => (
                <CheckRow
                  key={k}
                  label={ATTRIBUTE_LABELS[k] ?? k}
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
        )}
      </Modal>
    </div>
  );
}

/* ────────────────────────────────────────────────
   Inline stock control for the catalogue table.
   ──────────────────────────────────────────────── */
function StockCell({
  product,
  onAdjust,
  onSet,
}: {
  product: Product;
  onAdjust: (delta: number) => void;
  onSet: (quantity: number) => void;
}) {
  const st = stockStatus(product);
  const [val, setVal] = useState(String(product.stockQuantity ?? 0));

  // Keep the input in sync when the reactive query pushes a new value.
  useEffect(() => {
    setVal(String(product.stockQuantity ?? 0));
  }, [product.stockQuantity]);

  if (!st.tracked) {
    return <span className="text-[12px] text-text-secondary">Not tracked</span>;
  }

  const commit = () => {
    const n = Math.max(0, Math.round(parseFloat(val || '0')) || 0);
    if (n !== (product.stockQuantity ?? 0)) onSet(n);
    setVal(String(n));
  };

  const badge = st.soldOut
    ? { label: 'Out', cls: 'bg-red-50 text-red-600 ring-red-600/20' }
    : st.low
      ? { label: 'Low', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20' }
      : { label: 'In stock', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' };

  return (
    <div className="flex items-center gap-2.5">
      <div className="inline-flex items-center rounded-lg border border-black/10 bg-[#FCF8EF]">
        <button
          type="button"
          onClick={() => onAdjust(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-l-lg text-text-secondary hover:bg-black/[0.05] hover:text-text-primary disabled:opacity-30"
          disabled={(product.stockQuantity ?? 0) <= 0}
          aria-label="Decrease stock"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          inputMode="numeric"
          className="w-10 border-x border-black/10 bg-transparent py-1 text-center text-[13px] tabular-nums outline-none focus:bg-white"
          aria-label={`${product.name} stock quantity`}
        />
        <button
          type="button"
          onClick={() => onAdjust(1)}
          className="flex h-7 w-7 items-center justify-center rounded-r-lg text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
          aria-label="Increase stock"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.cls}`}
      >
        {badge.label}
      </span>
    </div>
  );
}
