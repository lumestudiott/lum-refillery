'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  FolderCog,
  Layers,
  X,
  GripVertical,
  Video,
  Copy as CopyIcon,
} from 'lucide-react';
import { api } from '../../../../convex/_generated/api';
import type { Doc, Id } from '../../../../convex/_generated/dataModel';
import {
  PRODUCT_CATEGORIES,
  PURCHASE_TYPES,
  DISCOUNT_TIERS,
  UNIT_TYPES,
  FOOD_ATTRIBUTES,
  HOME_ATTRIBUTES,
  ATTRIBUTE_LABELS,
  ATTRIBUTE_DESCRIPTIONS,
  UNIT_LABELS,
  categoryLabel,
  isHomeCategory,
  unitsForCategory,
} from '@/data/productCategories';
import { stockStatus } from '@/lib/stock';
import CategoryManager from './CategoryManager';
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

// ── Variant editor types ────────────────────────────────────────
type OptionDef = { name: string; values: string[] };

type VariantRow = {
  id?: string;
  sku: string;
  optionValues: Record<string, string>;
  priceDollars: string;
  trackInventory: boolean;
  stockQuantity: string;
  active: boolean;
};

function buildVariantMatrix(options: OptionDef[]): Record<string, string>[] {
  if (options.length === 0) return [];
  const nonEmpty = options.filter((o) => o.values.length > 0);
  if (nonEmpty.length === 0) return [];
  return nonEmpty.reduce<Record<string, string>[]>(
    (combos, opt) =>
      combos.flatMap((combo) =>
        opt.values.map((val) => ({ ...combo, [opt.name]: val }))
      ),
    [{}]
  );
}

type ImageEntry = { url: string; alt?: string };

type TabId = 'general' | 'pricing' | 'inventory' | 'media' | 'attributes' | 'variants';

const TABS: { id: TabId; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', hint: 'Product name, brand, SKU, category & tags.', icon: Info },
  { id: 'pricing', label: 'Pricing', hint: 'Price in TTD, discounts, units & purchase type.', icon: Tag },
  { id: 'inventory', label: 'Inventory', hint: 'Track stock and low-stock alerts.', icon: Boxes },
  { id: 'media', label: 'Media', hint: 'Images, image variations & video.', icon: ImageIcon },
  {
    id: 'attributes',
    label: 'Attributes',
    hint: 'Diet or eco labels for filters.',
    icon: SlidersHorizontal,
  },
  {
    id: 'variants',
    label: 'Variants',
    hint: 'Options like Size, Flavour — each combo gets its own price & stock.',
    icon: Layers,
  },
];

type FormState = {
  name: string;
  brand: string;
  sku: string;
  description: string;
  category: string;
  shopCategorySlug: string;
  shopSubcategorySlug: string;
  unit: string;
  unitType: string;
  priceDollars: string;
  depositDollars: string;
  discountTier: string;
  customDiscountPercent: string;
  trackInventory: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  imageUrl: string;
  images: ImageEntry[];
  videoUrl: string;
  tags: string[];
  purchaseType: string;
  active: boolean;
  attributes: Record<string, boolean>;
};

function emptyForm(): FormState {
  return {
    name: '',
    brand: '',
    sku: '',
    description: '',
    category: '',
    shopCategorySlug: '',
    shopSubcategorySlug: '',
    unit: 'ea',
    unitType: '',
    priceDollars: '',
    depositDollars: '',
    discountTier: 'tier0',
    customDiscountPercent: '',
    trackInventory: false,
    stockQuantity: '',
    lowStockThreshold: '',
    imageUrl: '',
    images: [],
    videoUrl: '',
    tags: [],
    purchaseType: 'one-time',
    active: true,
    attributes: {},
  };
}

function fromProduct(p: Product): FormState {
  return {
    name: p.name,
    brand: p.brand ?? '',
    sku: p.sku,
    description: p.description ?? '',
    category: p.category,
    shopCategorySlug: p.shopCategorySlug ?? '',
    shopSubcategorySlug: p.shopSubcategorySlug ?? '',
    unit: p.unit,
    unitType: p.unitType ?? '',
    priceDollars: (p.basePriceCents / 100).toFixed(2),
    depositDollars: p.depositCents ? (p.depositCents / 100).toFixed(2) : '',
    discountTier: p.discountTier ?? 'tier0',
    customDiscountPercent:
      p.customDiscountPercent != null ? String(p.customDiscountPercent) : '',
    trackInventory: p.trackInventory ?? false,
    stockQuantity: p.stockQuantity != null ? String(p.stockQuantity) : '',
    lowStockThreshold: p.lowStockThreshold != null ? String(p.lowStockThreshold) : '',
    imageUrl: p.imageUrl ?? '',
    images: p.images ?? [],
    videoUrl: p.videoUrl ?? '',
    tags: p.tags ?? [],
    purchaseType: p.purchaseType ?? 'one-time',
    active: p.active,
    attributes: { ...(p.attributes ?? {}) } as Record<string, boolean>,
  };
}

type CatOption = {
  code: string;
  label: string;
  description?: string;
  attributeSet: string;
  units: string[];
  active: boolean;
};

export default function Products() {
  const products = useQuery(api.admin.listProducts, {});
  const dbCategories = useQuery(api.catalog.listCategories, {});
  const dbTags = useQuery(api.tags.list, {});
  const shopCats = useQuery(api.shopCategories.listAll, {});
  const upsert = useMutation(api.products.upsertProduct);
  const setActive = useMutation(api.admin.setProductActive);
  const del = useMutation(api.admin.deleteProduct);
  const adjustStock = useMutation(api.products.adjustStock);
  const setStock = useMutation(api.products.setStock);
  const genUploadUrl = useMutation(api.products.generateUploadUrl);
  const getImageUrl = useMutation(api.products.getImageUrl);
  const ensureSeeded = useMutation(api.catalog.ensureSeeded);
  const ensureTagsSeeded = useMutation(api.tags.ensureSeeded);
  const createTag = useMutation(api.tags.create);
  const removeTag = useMutation(api.tags.remove);
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [managingCats, setManagingCats] = useState(false);
  const [tab, setTab] = useState<TabId>('general');
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagSearch, setTagSearch] = useState('');

  useEffect(() => {
    ensureSeeded().catch(() => {});
    ensureTagsSeeded().catch(() => {});
  }, [ensureSeeded, ensureTagsSeeded]);

  const staticCats: CatOption[] = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((c) => ({
        code: c.code,
        label: c.label,
        description: c.description,
        attributeSet: isHomeCategory(c.code) ? 'home' : 'food',
        units: unitsForCategory(c.code),
        active: true,
      })),
    []
  );
  const allCats: CatOption[] =
    dbCategories && dbCategories.length > 0
      ? dbCategories.map((c) => ({
          code: c.code,
          label: c.label,
          description: c.description,
          attributeSet: c.attributeSet,
          units: c.units,
          active: c.active,
        }))
      : staticCats;
  const catByCode = useMemo(
    () => new Map(allCats.map((c) => [c.code, c])),
    [allCats]
  );
  const activeCats = allCats.filter((c) => c.active);
  function catLabel(code: string): string {
    return catByCode.get(code)?.label ?? categoryLabel(code);
  }
  function isHomeCat(code: string): boolean {
    const c = catByCode.get(code);
    return c ? c.attributeSet === 'home' : isHomeCategory(code);
  }

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
  /** Pre-fill the create form from an existing product (multi-flavour workflow).
   *  SKU is cleared so saving creates a new product instead of updating. */
  function openDuplicate(p: Product) {
    setForm({ ...fromProduct(p), sku: '', name: `${p.name} (Copy)` });
    setEditing(null);
    setTab('general');
    setCreating(true);
  }

  function changeCategory(code: string) {
    const units = catByCode.get(code)?.units ?? unitsForCategory(code);
    setForm((f) => ({
      ...f,
      category: code,
      unit: units.includes(f.unit) ? f.unit : units[0] ?? 'ea',
    }));
  }

  // ── Tag helpers ──
  function addTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    setForm((f) =>
      f.tags.some((x) => x.toLowerCase() === t.toLowerCase())
        ? f
        : { ...f, tags: [...f.tags, t] }
    );
    createTag({ name: t }).catch(() => {});
  }
  function removeFormTag(tag: string) {
    setForm((f) => ({
      ...f,
      tags: f.tags.filter((t) => t.toLowerCase() !== tag.toLowerCase()),
    }));
  }
  const filteredTags = useMemo(() => {
    if (!dbTags) return [];
    const q = tagSearch.toLowerCase();
    return dbTags.filter(
      (t) =>
        t.name.toLowerCase().includes(q) &&
        !form.tags.some((ft) => ft.toLowerCase() === t.name.toLowerCase())
    );
  }, [dbTags, tagSearch, form.tags]);

  // ── Image upload ──
  async function uploadImage(file: File): Promise<string | null> {
    try {
      const url = await genUploadUrl();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      const { storageId } = (await res.json()) as { storageId: string };
      return await getImageUrl({ storageId: storageId as Id<'_storage'> });
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Upload failed', 'error');
      return null;
    }
  }

  async function onPrimaryImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const publicUrl = await uploadImage(file);
    if (publicUrl) setForm((f) => ({ ...f, imageUrl: publicUrl }));
    setUploading(false);
    toast('Image uploaded');
  }

  async function onAdditionalImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const publicUrl = await uploadImage(file);
    if (publicUrl) {
      setForm((f) => ({
        ...f,
        images: [...f.images, { url: publicUrl }],
      }));
      toast('Image added');
    }
    setUploading(false);
  }

  async function onVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    const publicUrl = await uploadImage(file);
    if (publicUrl) {
      setForm((f) => ({ ...f, videoUrl: publicUrl }));
      toast('Video uploaded');
    }
    setUploading(false);
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  // ── Unit type helper ──
  function changeUnitType(type: string) {
    const group = UNIT_TYPES.find((ut) => ut.value === type);
    setForm((f) => ({
      ...f,
      unitType: type,
      unit: group ? group.units[0] : f.unit,
    }));
  }

  async function save() {
    if (!form.name.trim() || !form.category.trim()) {
      setTab('general');
      toast('Product name and category are required', 'error');
      return;
    }
    if (!form.sku.trim() && !editing) {
      setTab('general');
      toast('SKU is required', 'error');
      return;
    }
    const priceCents = Math.round(parseFloat(form.priceDollars || '0') * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      setTab('pricing');
      toast('Enter a valid price', 'error');
      return;
    }

    const relevant = isHomeCat(form.category) ? HOME_ATTRIBUTES : FOOD_ATTRIBUTES;
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

    const customDiscountPercent = form.customDiscountPercent.trim()
      ? parseFloat(form.customDiscountPercent)
      : undefined;

    setSaving(true);
    try {
      await upsert({
        sku: form.sku.trim() || (editing ? editing.sku : undefined),
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        description: form.description.trim() || undefined,
        category: form.category,
        shopCategorySlug: form.shopCategorySlug || undefined,
        shopSubcategorySlug: form.shopSubcategorySlug || undefined,
        unit: form.unit,
        unitType: form.unitType || undefined,
        basePriceCents: priceCents,
        discountTier: form.discountTier || undefined,
        customDiscountPercent,
        trackInventory,
        stockQuantity,
        lowStockThreshold,
        depositCents,
        imageUrl: form.imageUrl.trim() || undefined,
        images: form.images.length > 0 ? form.images : undefined,
        videoUrl: form.videoUrl.trim() || undefined,
        attributes: Object.keys(attributes).length ? attributes : undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
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

  const selectedCategory = catByCode.get(form.category);
  const isHome = isHomeCat(form.category);
  const attrKeys = isHome ? HOME_ATTRIBUTES : FOOD_ATTRIBUTES;
  const units = selectedCategory?.units ?? unitsForCategory(form.category);
  const activeTab = TABS.find((t) => t.id === tab);
  const selectedPurchaseType = PURCHASE_TYPES.find((pt) => pt.value === form.purchaseType);
  const categoryOptions: CatOption[] = (() => {
    const base =
      form.category && selectedCategory && !selectedCategory.active
        ? [selectedCategory, ...activeCats]
        : activeCats;
    if (form.category && !base.some((c) => c.code === form.category)) {
      return [
        {
          code: form.category,
          label: catLabel(form.category),
          attributeSet: isHome ? 'home' : 'food',
          units,
          active: true,
        },
        ...base,
      ];
    }
    return base;
  })();

  // Shop categories for dropdown
  const shopParents = useMemo(() => shopCats ?? [], [shopCats]);
  const selectedShopParent = shopParents.find((p) => p.slug === form.shopCategorySlug);

  // Unit type filtered units
  const unitTypeGroup = UNIT_TYPES.find((ut) => ut.value === form.unitType);
  const filteredUnits = unitTypeGroup ? unitTypeGroup.units : units;

  return (
    <div>
      <SectionHeader
        title="Products"
        subtitle="Your full catalogue — enter a SKU for each product."
        actions={
          <>
            <Btn onClick={() => setManagingCats(true)}>
              <FolderCog className="h-4 w-4" /> Manage categories
            </Btn>
            <Btn variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" /> New product
            </Btn>
          </>
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
              {catLabel(c)}
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
                        {p.brand && <span>{p.brand} · </span>}
                        {p.unit}
                        {p.tags && p.tags.length > 0 && ` · ${p.tags.join(', ')}`}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td className="font-mono text-[12px] text-text-secondary">{p.sku}</Td>
                <Td>{catLabel(p.category)}</Td>
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
                      onClick={() => openDuplicate(p)}
                      className="rounded-lg p-2 text-text-secondary hover:bg-black/[0.05] hover:text-text-primary"
                      title="Duplicate (copy this entry for a new flavour or size)"
                    >
                      <CopyIcon className="h-4 w-4" />
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
              label="Product Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Organic Brown Rice"
            />
            <TextField
              label="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="e.g. Island Harvest, Lumë"
            />
            <TextField
              label="SKU *"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder="e.g. GP-0007"
            />
            <div>
              <SelectField
                label="Category *"
                value={form.category}
                onChange={(e) => changeCategory(e.target.value)}
              >
                <option value="" disabled>
                  Select a category…
                </option>
                {categoryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code})
                  </option>
                ))}
              </SelectField>
              {selectedCategory && (
                <p className="mt-1.5 text-[12px] leading-snug text-text-secondary">
                  {selectedCategory.description ?? ''}
                </p>
              )}
            </div>

            {/* Master category (shop tabs) */}
            <SelectField
              label="Shop Category"
              value={form.shopCategorySlug}
              onChange={(e) =>
                setForm({ ...form, shopCategorySlug: e.target.value, shopSubcategorySlug: '' })
              }
            >
              <option value="">None</option>
              {shopParents.map((p) => (
                <option key={p._id} value={p.slug}>
                  {p.label}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Sub-category"
              value={form.shopSubcategorySlug}
              onChange={(e) => setForm({ ...form, shopSubcategorySlug: e.target.value })}
              disabled={!selectedShopParent}
            >
              <option value="">None</option>
              {selectedShopParent?.subcategories.map((s) => (
                <option key={s._id} value={s.slug}>
                  {s.label}
                </option>
              ))}
            </SelectField>

            <div className="sm:col-span-2">
              <TextArea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Sourcing & flavour notes for food, or material & care for retail."
              />
            </div>

            {/* Tags CRUD dropdown */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Tags
              </label>
              {/* Selected tags */}
              {form.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full border border-lume-accent bg-lume-accent/10 px-3 py-1 text-[12px] font-medium text-lume-accent"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeFormTag(t)}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-lume-accent/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Search + add */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                <input
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && tagSearch.trim()) {
                      e.preventDefault();
                      addTag(tagSearch);
                      setTagSearch('');
                    }
                  }}
                  placeholder="Search or add tags…"
                  className="w-full rounded-xl border border-[#E6DBC4] bg-[#FCF8EF]/85 py-2 pl-9 pr-3 text-[13px] outline-none focus:border-lume-accent"
                />
              </div>
              {/* Dropdown */}
              {tagSearch.trim() && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-[#E6DBC4] bg-canvas shadow-lg">
                  {filteredTags.length > 0 ? (
                    filteredTags.slice(0, 12).map((t) => (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => {
                          addTag(t.name);
                          setTagSearch('');
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-text-primary hover:bg-lume-accent/5"
                      >
                        {t.name}
                        <Plus className="h-3.5 w-3.5 text-text-secondary" />
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addTag(tagSearch);
                        setTagSearch('');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-lume-accent hover:bg-lume-accent/5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create &ldquo;{tagSearch.trim()}&rdquo;
                    </button>
                  )}
                </div>
              )}
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
              label="Base Retail Price (TTD)"
              type="number"
              step="0.01"
              min="0"
              value={form.priceDollars}
              onChange={(e) => setForm({ ...form, priceDollars: e.target.value })}
              placeholder="0.00"
            />

            {/* Unit type selector */}
            <SelectField
              label="Measurement Type"
              value={form.unitType}
              onChange={(e) => changeUnitType(e.target.value)}
            >
              <option value="">Select type…</option>
              {UNIT_TYPES.map((ut) => (
                <option key={ut.value} value={ut.value}>
                  {ut.label}
                </option>
              ))}
            </SelectField>

            <SelectField
              label={form.unitType ? `Unit (${UNIT_TYPES.find((ut) => ut.value === form.unitType)?.label ?? ''})` : 'Unit'}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            >
              {filteredUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                  {UNIT_LABELS[u] ? ` — ${UNIT_LABELS[u]}` : ''}
                </option>
              ))}
            </SelectField>

            {/* Discount tier */}
            <SelectField
              label="Discount Tier Level"
              value={form.discountTier}
              onChange={(e) => setForm({ ...form, discountTier: e.target.value })}
            >
              {DISCOUNT_TIERS.map((tier) => (
                <option key={tier.value} value={tier.value}>
                  {tier.label}
                </option>
              ))}
            </SelectField>

            {/* Custom discount */}
            <TextField
              label="Custom Discount (%)"
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={form.customDiscountPercent}
              onChange={(e) => setForm({ ...form, customDiscountPercent: e.target.value })}
              placeholder="e.g. 15"
            />

            {/* Purchase type */}
            <div className="sm:col-span-2">
              <SelectField
                label="Purchase Type"
                value={form.purchaseType}
                onChange={(e) => setForm({ ...form, purchaseType: e.target.value })}
              >
                {PURCHASE_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </SelectField>
              {selectedPurchaseType && (
                <p className="mt-1.5 text-[12px] leading-snug text-text-secondary">
                  {selectedPurchaseType.description}
                </p>
              )}
            </div>

            {form.purchaseType === 'deposit' && (
              <TextField
                label="Deposit (TTD, refundable)"
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

        {/* ── Media ── */}
        {tab === 'media' && (
          <div className="grid gap-5">
            {/* Primary image */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Primary Image
              </label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt=""
                    className="h-20 w-20 rounded-xl border border-black/10 object-cover"
                  />
                )}
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/[0.12] bg-[#FCF8EF] px-3.5 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:border-lume-accent/40">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading…' : 'Upload primary'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={onPrimaryImage}
                    />
                  </label>
                  <TextField
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="Or paste URL"
                  />
                </div>
              </div>
            </div>

            {/* Additional image variations */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Image Variations
              </label>
              <p className="mb-2 text-[12px] text-text-secondary">
                Add different angles, close-ups, or lifestyle shots. Drag to reorder.
              </p>
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.alt ?? ''}
                      className="h-20 w-20 rounded-xl border border-black/10 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-red-500 p-0.5 text-white shadow group-hover:flex"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/[0.15] text-text-secondary transition-colors hover:border-lume-accent/40 hover:text-lume-accent">
                  <Plus className="h-5 w-5" />
                  <span className="text-[10px] font-medium">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={onAdditionalImage}
                  />
                </label>
              </div>
            </div>

            {/* Video */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Video
              </label>
              <div className="flex items-center gap-3">
                {form.videoUrl && (
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-black/10 bg-black/5">
                    <Video className="h-8 w-8 text-text-secondary" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/[0.12] bg-[#FCF8EF] px-3.5 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:border-lume-accent/40">
                    <Video className="h-4 w-4" />
                    {uploading ? 'Uploading…' : 'Upload video'}
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={onVideo}
                    />
                  </label>
                  <TextField
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="Or paste video URL"
                  />
                </div>
              </div>
              {form.videoUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, videoUrl: '' })}
                  className="mt-2 text-[12px] text-red-500 hover:underline"
                >
                  Remove video
                </button>
              )}
            </div>
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
            <div className="grid gap-1.5 sm:grid-cols-2">
              {attrKeys.map((k) => (
                <AttributeCheck
                  key={k}
                  label={ATTRIBUTE_LABELS[k] ?? k}
                  description={ATTRIBUTE_DESCRIPTIONS[k] ?? ''}
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

      <CategoryManager open={managingCats} onClose={() => setManagingCats(false)} />
    </div>
  );
}

/* ────────────────────────────────────────────────
   Attribute checkbox with an explainer line.
   ──────────────────────────────────────────────── */
function AttributeCheck({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-transparent p-2 transition-colors hover:bg-black/[0.02]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-lume-accent"
      />
      <span className="flex flex-col">
        <span className="text-[13px] font-medium text-text-primary">{label}</span>
        {description && (
          <span className="text-[11px] leading-snug text-text-secondary">{description}</span>
        )}
      </span>
    </label>
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
