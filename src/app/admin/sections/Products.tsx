'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import {
  Plus,
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
  BookOpen,
  AlertTriangle,
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
  useAction,
  useToast,
} from '../lib';

type Product = Doc<'products'>;

// ── Variant editor types ────────────────────────────────────────
// One row per purchasable size/pack (e.g. "250ml One Way Glass").
// Sizes don't carry a standalone price — each sells as ¼/½/full case
// with its own quantity + price per fraction.
type VariantRowForm = {
  id?: string;
  label: string;
  price: string;
  imageUrl: string;
  images: ImageEntry[];
  videoUrl: string;
  enableQuarter: boolean;
  quarterQty: string;
  quarterPrice: string;
  enableHalf: boolean;
  halfQty: string;
  halfPrice: string;
  enableFull: boolean;
  fullQty: string;
  fullPrice: string;
  // Per-size inventory (used when "track quantity" is on)
  stockQuantity: string;
  lowStockThreshold: string;
  active: boolean;
};

function emptyVariantRow(): VariantRowForm {
  return {
    label: '',
    price: '',
    imageUrl: '',
    images: [],
    videoUrl: '',
    enableQuarter: false,
    quarterQty: '',
    quarterPrice: '',
    enableHalf: true,
    halfQty: '',
    halfPrice: '',
    enableFull: true,
    fullQty: '',
    fullPrice: '',
    stockQuantity: '',
    lowStockThreshold: '',
    active: true,
  };
}

type ImageEntry = { url: string; alt?: string };

type TabId = 'general' | 'pricing' | 'inventory' | 'media' | 'details' | 'attributes' | 'variants';

const TABS: { id: TabId; label: string; hint: string; icon: React.ElementType }[] = [
  { id: 'general', label: 'General', hint: 'The basics — what this product is and where it appears in the shop.', icon: Info },
  { id: 'pricing', label: 'Pricing', hint: 'Price in TTD, discounts, units & purchase type.', icon: Tag },
  { id: 'inventory', label: 'Inventory', hint: 'Track stock and low-stock alerts.', icon: Boxes },
  { id: 'media', label: 'Media', hint: 'Images, image variations & video.', icon: ImageIcon },
  {
    id: 'details',
    label: 'Details',
    hint: 'Producer story, ingredients & storage guide - shown as tabs on the product page.',
    icon: BookOpen,
  },
  {
    id: 'attributes',
    label: 'Attributes',
    hint: 'Diet or eco labels for filters.',
    icon: SlidersHorizontal,
  },
  {
    id: 'variants',
    label: 'Variants',
    hint: 'Options like Size, Flavour - each combo gets its own price & stock.',
    icon: Layers,
  },
];

type FormState = {
  name: string;
  brand: string;
  sku: string;
  slug: string;
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
  producerName: string;
  producerLocation: string;
  producerText: string;
  producerImageUrl: string;
  storageText: string;
  storageImageUrl: string;
  ingredientsText: string;
  ingredientsImageUrl: string;
  tags: string[];
  purchaseTypes: string[];
  active: boolean;
  attributes: Record<string, boolean>;
  customAttributes: string[];
  // Variants (sizes/packs with image & price)
  optionName: string;
  variantRows: VariantRowForm[];
  // Case/bulk pricing
  casePricingEnabled: boolean;
  caseItemLabel: string;
  enableQuarterCase: boolean;
  quarterQty: string;
  quarterPrice: string;
  enableHalfCase: boolean;
  halfQty: string;
  halfPrice: string;
  enableFullCase: boolean;
  fullQty: string;
  fullPrice: string;
};

/** Client-side slug preview; mirrors the backend normalizeSlug. */
function slugify(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function emptyForm(): FormState {
  return {
    name: '',
    brand: '',
    sku: '',
    slug: '',
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
    producerName: '',
    producerLocation: '',
    producerText: '',
    producerImageUrl: '',
    storageText: '',
    storageImageUrl: '',
    ingredientsText: '',
    ingredientsImageUrl: '',
    tags: [],
    purchaseTypes: ['one-time'],
    active: true,
    attributes: {},
    customAttributes: [],
    // Variants
    optionName: 'Size',
    variantRows: [],
    // Case/bulk pricing
    casePricingEnabled: false,
    caseItemLabel: 'bottle',
    enableQuarterCase: false,
    quarterQty: '',
    quarterPrice: '',
    enableHalfCase: true,
    halfQty: '',
    halfPrice: '',
    enableFullCase: true,
    fullQty: '',
    fullPrice: '',
  };
}

/** Resolve a fraction's item quantity: explicit field, else legacy caseSize × fraction. */
function caseQtyString(
  explicitQty: number | undefined,
  caseSize: number | undefined,
  fraction: number
): string {
  if (explicitQty != null) return String(explicitQty);
  if (caseSize != null) return String(Math.max(1, Math.floor(caseSize * fraction)));
  return '';
}

function fromProduct(p: Product): FormState {
  return {
    name: p.name,
    brand: p.brand ?? '',
    sku: p.sku,
    slug: p.slug ?? '',
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
    producerName: p.producer?.name ?? '',
    producerLocation: p.producer?.location ?? '',
    producerText: p.producer?.text ?? '',
    producerImageUrl: p.producer?.imageUrl ?? '',
    storageText: p.storageTips?.text ?? '',
    storageImageUrl: p.storageTips?.imageUrl ?? '',
    ingredientsText: p.ingredients?.text ?? '',
    ingredientsImageUrl: p.ingredients?.imageUrl ?? '',
    tags: p.tags ?? [],
    purchaseTypes:
      p.purchaseTypes ?? (p.purchaseType ? [p.purchaseType] : ['one-time']),
    active: p.active,
    attributes: { ...(p.attributes ?? {}) } as Record<string, boolean>,
    customAttributes: p.customAttributes ?? [],
    // Variants: rows are hydrated async from listAllVariants (see effect).
    optionName: p.options?.[0]?.name ?? 'Size',
    variantRows: [],
    // Case/bulk pricing. Quantities read from the explicit per-fraction field,
    // falling back to the legacy caseSize × fraction for older products.
    casePricingEnabled: !!p.casePricing,
    caseItemLabel: p.casePricing?.itemLabel ?? 'bottle',
    enableQuarterCase: p.casePricing?.enableQuarter ?? false,
    quarterQty: caseQtyString(p.casePricing?.quarterQty, p.casePricing?.caseSize, 0.25),
    quarterPrice: p.casePricing?.quarterPriceCents != null ? (p.casePricing.quarterPriceCents / 100).toFixed(2) : '',
    enableHalfCase: p.casePricing?.enableHalf ?? true,
    halfQty: caseQtyString(p.casePricing?.halfQty, p.casePricing?.caseSize, 0.5),
    halfPrice: p.casePricing?.halfPriceCents != null ? (p.casePricing.halfPriceCents / 100).toFixed(2) : '',
    enableFullCase: p.casePricing?.enableFull ?? true,
    fullQty: caseQtyString(p.casePricing?.fullQty, p.casePricing?.caseSize, 1),
    fullPrice: p.casePricing?.fullPriceCents != null ? (p.casePricing.fullPriceCents / 100).toFixed(2) : '',
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
  const genUploadUrl = useMutation(api.products.generateUploadUrl);
  const getImageUrl = useMutation(api.products.getImageUrl);
  const saveVariantsMut = useMutation(api.products.saveVariants);
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
  const [mediaTab, setMediaTab] = useState<'base' | number>('base');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [editSession, setEditSession] = useState(0);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [customAttrInput, setCustomAttrInput] = useState('');

  useEffect(() => {
    ensureSeeded().catch(() => {});
    ensureTagsSeeded().catch(() => {});
  }, [ensureSeeded, ensureTagsSeeded]);

  // Hydrate variant rows for the product being edited (variants live in
  // their own table, so they arrive async after the modal opens).
  const editingVariants = useQuery(
    api.products.listAllVariants,
    editing ? { productId: editing._id } : 'skip'
  );
  useEffect(() => {
    if (!editing || !editingVariants) return;
    const optName = editing.options?.[0]?.name ?? 'Size';
    const price = (cents?: number) => (cents != null ? (cents / 100).toFixed(2) : '');
    const qty = (n?: number) => (n != null ? String(n) : '');
    setForm((f) => ({
      ...f,
      optionName: optName,
      variantRows: editingVariants.map((v) => {
        const cp = v.casePricing;
        return {
          id: v._id,
          label: v.optionValues[optName] ?? Object.values(v.optionValues)[0] ?? '',
          price: price(v.priceCents),
          imageUrl: v.imageUrl ?? '',
          images: v.images ?? [],
          videoUrl: v.videoUrl ?? '',
          enableQuarter: cp?.enableQuarter ?? false,
          quarterQty: qty(cp?.quarterQty),
          quarterPrice: price(cp?.quarterPriceCents),
          enableHalf: cp?.enableHalf ?? true,
          halfQty: qty(cp?.halfQty),
          halfPrice: price(cp?.halfPriceCents),
          enableFull: cp?.enableFull ?? true,
          fullQty: qty(cp?.fullQty),
          fullPrice: price(cp?.fullPriceCents),
          stockQuantity: qty(v.stockQuantity),
          lowStockThreshold: qty(v.lowStockThreshold),
          active: v.active,
        };
      }),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingVariants, editing?._id, editSession]);

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
    setMediaTab('base');
    setCreating(true);
  }
  function openEdit(p: Product) {
    setForm(fromProduct(p));
    setEditing(p);
    setTab('general');
    setMediaTab('base');
    setCreating(true);
    // Bump the session so variant rows re-hydrate even when the cached
    // query result hasn't changed (e.g. reopening the same product).
    setEditSession((s) => s + 1);
  }
  /** Pre-fill the create form from an existing product (multi-flavour workflow).
   *  SKU is cleared so saving creates a new product instead of updating. */
  function openDuplicate(p: Product) {
    setForm({ ...fromProduct(p), sku: '', name: `${p.name} (Copy)` });
    setEditing(null);
    setTab('general');
    setMediaTab('base');
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
  /** Strip the background from product photos so they sit on the site's
   *  canvas. Falls back to the original file if removal fails. */
  async function stripBackground(file: File): Promise<Blob> {
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      return await removeBackground(file, { output: { format: 'image/png' } });
    } catch {
      toast('Background removal failed - uploading original', 'error');
      return file;
    }
  }

  async function uploadImage(file: File, removeBg = true): Promise<string | null> {
    try {
      let body: Blob = file;
      let contentType = file.type;
      if (removeBg && file.type.startsWith('image/')) {
        toast('Removing background…');
        body = await stripBackground(file);
        contentType = body.type || 'image/png';
      }
      const url = await genUploadUrl();
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body,
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
    if (publicUrl) {
      if (mediaTab === 'base') {
        setForm((f) => ({ ...f, imageUrl: publicUrl }));
      } else {
        setForm((f) => ({
          ...f,
          variantRows: f.variantRows.map((r, i) =>
            i === mediaTab ? { ...r, imageUrl: publicUrl } : r
          ),
        }));
      }
    }
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
      if (mediaTab === 'base') {
        setForm((f) => ({
          ...f,
          images: [...f.images, { url: publicUrl }],
        }));
      } else {
        setForm((f) => ({
          ...f,
          variantRows: f.variantRows.map((r, i) =>
            i === mediaTab ? { ...r, images: [...r.images, { url: publicUrl }] } : r
          ),
        }));
      }
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
      if (mediaTab === 'base') {
        setForm((f) => ({ ...f, videoUrl: publicUrl }));
      } else {
        setForm((f) => ({
          ...f,
          variantRows: f.variantRows.map((r, i) =>
            i === mediaTab ? { ...r, videoUrl: publicUrl } : r
          ),
        }));
      }
      toast('Video uploaded');
    }
    setUploading(false);
  }

  function removeImage(idx: number) {
    if (mediaTab === 'base') {
      setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    } else {
      setForm((f) => ({
        ...f,
        variantRows: f.variantRows.map((r, i) =>
          i === mediaTab ? { ...r, images: r.images.filter((_, j) => j !== idx) } : r
        ),
      }));
    }
  }

  /** Drag-to-reorder for the variation grid (routes to base or size). */
  function moveImage(from: number, to: number) {
    if (from === to) return;
    const reorder = (arr: ImageEntry[]) => {
      const next = [...arr];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    };
    if (mediaTab === 'base') {
      setForm((f) => ({ ...f, images: reorder(f.images) }));
    } else {
      setForm((f) => ({
        ...f,
        variantRows: f.variantRows.map((r, i) =>
          i === mediaTab ? { ...r, images: reorder(r.images) } : r
        ),
      }));
    }
  }

  /** Upload an image for a PDP detail section (producer / storage /
   *  ingredients). These are scenic photos - keep their backgrounds. */
  function onSectionImage(
    field: 'producerImageUrl' | 'storageImageUrl' | 'ingredientsImageUrl'
  ) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setUploading(true);
      const publicUrl = await uploadImage(file, false);
      if (publicUrl) {
        setForm((f) => ({ ...f, [field]: publicUrl }));
        toast('Image uploaded');
      }
      setUploading(false);
    };
  }

  /** Upload an image for a variant row (size/pack). Backgrounds are
   *  stripped like the main product shots so tiles look consistent. */
  function onVariantImage(idx: number) {
    return async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      setUploading(true);
      const publicUrl = await uploadImage(file);
      if (publicUrl) {
        setForm((f) => ({
          ...f,
          variantRows: f.variantRows.map((r, i) =>
            i === idx ? { ...r, imageUrl: publicUrl } : r
          ),
        }));
        toast('Image uploaded');
      }
      setUploading(false);
    };
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
      form.purchaseTypes.includes('deposit')
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

    const parseQty = (v: string) =>
      v.trim() ? Math.max(1, parseInt(v, 10)) : undefined;
    const quarterQty = parseQty(form.quarterQty);
    const halfQty = parseQty(form.halfQty);
    const fullQty = parseQty(form.fullQty);

    const casePricing = form.casePricingEnabled
      ? {
          // Legacy field kept in sync (largest enabled qty) for any old consumers.
          caseSize: fullQty ?? (halfQty != null ? halfQty * 2 : undefined) ?? (quarterQty != null ? quarterQty * 4 : undefined),
          itemLabel: form.caseItemLabel.trim() || undefined,
          enableQuarter: form.enableQuarterCase,
          quarterQty,
          quarterPriceCents: form.quarterPrice.trim() ? Math.round(parseFloat(form.quarterPrice) * 100) : undefined,
          enableHalf: form.enableHalfCase,
          halfQty,
          halfPriceCents: form.halfPrice.trim() ? Math.round(parseFloat(form.halfPrice) * 100) : undefined,
          enableFull: form.enableFullCase,
          fullQty,
          fullPriceCents: form.fullPrice.trim() ? Math.round(parseFloat(form.fullPrice) * 100) : undefined,
        }
      : undefined;

    // Variant rows with a label become purchasable sizes; the product's
    // `options` field is derived from them so the PDP knows to render tiles.
    const validVariantRows = form.variantRows.filter((r) => r.label.trim());
    const optionName = form.optionName.trim() || 'Size';

    setSaving(true);
    try {
      const productId = await upsert({
        sku: form.sku.trim() || (editing ? editing.sku : undefined),
        slug: form.slug.trim() || undefined,
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
        // Empty object (not undefined) so clearing the fields in the admin
        // actually clears the section on the product.
        producer: {
          name: form.producerName.trim() || undefined,
          location: form.producerLocation.trim() || undefined,
          text: form.producerText.trim() || undefined,
          imageUrl: form.producerImageUrl || undefined,
        },
        storageTips: {
          text: form.storageText.trim() || undefined,
          imageUrl: form.storageImageUrl || undefined,
        },
        ingredients: {
          text: form.ingredientsText.trim() || undefined,
          imageUrl: form.ingredientsImageUrl || undefined,
        },
        attributes: Object.keys(attributes).length ? attributes : undefined,
        customAttributes:
          form.customAttributes.length > 0 ? form.customAttributes : undefined,
        tags: form.tags.length > 0 ? form.tags : undefined,
        // Legacy single value stays synced with the first checked type.
        purchaseType: form.purchaseTypes[0] ?? 'one-time',
        purchaseTypes: form.purchaseTypes,
        casePricing,
        // Empty array (not undefined) so removing every variant row
        // actually clears the options on the product.
        options:
          validVariantRows.length > 0
            ? [{ name: optionName, values: validVariantRows.map((r) => r.label.trim()) }]
            : [],
        active: form.active,
      });

      // Sync the variants table with the rows (replaces the existing set).
      const baseSku = form.sku.trim() || (editing ? editing.sku : '');
      const toCents = (val: string) =>
        val.trim() ? Math.round(parseFloat(val) * 100) : undefined;
      await saveVariantsMut({
        productId,
        variants: validVariantRows.map((r, i) => {
          const directPriceCents = toCents(r.price);
          const quarterPriceCents = r.enableQuarter ? toCents(r.quarterPrice) : undefined;
          const halfPriceCents = r.enableHalf ? toCents(r.halfPrice) : undefined;
          const fullPriceCents = r.enableFull ? toCents(r.fullPrice) : undefined;
          return {
            id: (r.id || undefined) as Id<'productVariants'> | undefined,
            sku: `${baseSku}-${slugify(r.label).toUpperCase() || `V${i + 1}`}`,
            optionValues: { [optionName]: r.label.trim() },
            // Headline price for the size: direct price if set,
            // else cheapest enabled case option, falling back to base price.
            priceCents:
              directPriceCents ?? quarterPriceCents ?? halfPriceCents ?? fullPriceCents ?? priceCents,
            imageUrl: r.imageUrl || undefined,
            images: r.images.length > 0 ? r.images : undefined,
            videoUrl: r.videoUrl.trim() || undefined,
            // Per-size inventory follows the product's master tracking toggle.
            trackInventory: trackInventory || undefined,
            stockQuantity: trackInventory
              ? Math.max(0, Math.round(parseFloat(r.stockQuantity || '0')))
              : undefined,
            lowStockThreshold:
              trackInventory && r.lowStockThreshold.trim()
                ? Math.max(0, Math.round(parseFloat(r.lowStockThreshold)))
                : undefined,
            casePricing: {
              itemLabel: form.caseItemLabel.trim() || undefined,
              enableQuarter: r.enableQuarter,
              quarterQty: parseQty(r.quarterQty),
              quarterPriceCents,
              enableHalf: r.enableHalf,
              halfQty: parseQty(r.halfQty),
              halfPriceCents,
              enableFull: r.enableFull,
              fullQty: parseQty(r.fullQty),
              fullPriceCents,
            },
            active: r.active,
          };
        }),
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

  const selectedCategory = catByCode.get(form.category);
  const isHome = isHomeCat(form.category);
  const attrKeys = isHome ? HOME_ATTRIBUTES : FOOD_ATTRIBUTES;
  const units = selectedCategory?.units ?? unitsForCategory(form.category);
  const activeTab = TABS.find((t) => t.id === tab);
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
        subtitle="Browse, search and manage every product in your store."
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
          className="appearance-none rounded-lg border border-black/[0.1] bg-[#FCF8EF] py-2 pl-3.5 pr-8 text-[14px] outline-none focus:border-lume-accent bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%234A3E2C%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:14px_14px] bg-[right_10px_center] bg-no-repeat cursor-pointer"
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
                <Td>
                  <StockPill product={p} variantStock={p.variantStock} />
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
          <div className="space-y-5">
            {/* ── Visibility (top) ── */}
            <CheckRow
              label="Show this product in the shop"
              checked={form.active}
              onChange={(v) => setForm({ ...form, active: v })}
            />

            <hr className="border-black/[0.06]" />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Product Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Moringa Powder, Coconut Oil"
              />
              <TextField
                label="Brand (optional)"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Sungrown Harvest, Blue Waters"
              />
            </div>

            <hr className="border-black/[0.06]" />

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="SKU *"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. FP-HERB-01, BEV-HYD-01"
              />
              <div className="sm:col-span-2">
                <TextField
                  label="Page URL (optional)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. moringa-powder, hot-pepper-flakes"
                />
                {form.slug.trim() && (
                  <p className="mt-1.5 text-[12px] leading-snug text-text-secondary">
                    This product will appear at&nbsp;
                    <span className="font-medium text-text-primary">
                      /shop/{slugify(form.slug)}
                    </span>
                  </p>
                )}
                <p className="mt-1 text-[12px] leading-snug text-text-secondary">
                  A short, readable link for this product. Letters, numbers and hyphens only.
                </p>
              </div>
            </div>

            <hr className="border-black/[0.06]" />

            <div className="grid gap-4 sm:grid-cols-2">
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

              <SelectField
                label="Shop Category (optional)"
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
                label="Sub-category (optional)"
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
            </div>

            <hr className="border-black/[0.06]" />

            <TextArea
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Locally grown and sun-dried. Rich in vitamins A and C."
            />

            <hr className="border-black/[0.06]" />

            {/* Tags */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Tags (optional)
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
                  {UNIT_LABELS[u] ? ` - ${UNIT_LABELS[u]}` : ''}
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
            {/* Case pricing now lives per-size on the Variants tab. */}

            {/* Purchase types (multi-select) - controls the buttons on the
                product page: One-time → Add, Subscription → Subscribe. */}
            <div className="sm:col-span-2">
              <div className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
                Purchase Types
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {PURCHASE_TYPES.map((pt) => (
                  <AttributeCheck
                    key={pt.value}
                    label={pt.label}
                    description={pt.description}
                    checked={form.purchaseTypes.includes(pt.value)}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        purchaseTypes: v
                          ? [...form.purchaseTypes, pt.value]
                          : form.purchaseTypes.filter((t) => t !== pt.value),
                      })
                    }
                  />
                ))}
              </div>
            </div>

            {form.purchaseTypes.includes('deposit') && (
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
            {form.trackInventory && form.variantRows.length > 0 ? (
              /* Per-size stock: one row per size from the Variants tab. */
              <div className="flex flex-col gap-2.5">
                <span className="text-[13px] font-medium text-text-primary">
                  Stock per {form.optionName.trim() || 'Size'}
                </span>
                <div className="grid grid-cols-[1fr_8rem_8rem] items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  <span>{form.optionName.trim() || 'Size'}</span>
                  <span>On hand</span>
                  <span>Low-stock at</span>
                </div>
                {form.variantRows.map((row, i) => (
                  <div
                    key={row.id ?? `inv-${i}`}
                    className="grid grid-cols-[1fr_8rem_8rem] items-center gap-3 rounded-xl border border-[#E6DBC4] bg-[#FCF8EF]/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {row.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.imageUrl}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-md object-contain"
                        />
                      )}
                      <span className="truncate text-[13px] font-medium text-text-primary">
                        {row.label || `Size ${i + 1}`}
                      </span>
                    </div>
                    <TextField
                      label=""
                      type="number"
                      min="0"
                      step="1"
                      value={row.stockQuantity}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          variantRows: form.variantRows.map((r, j) =>
                            j === i ? { ...r, stockQuantity: e.target.value } : r
                          ),
                        })
                      }
                      placeholder="0"
                    />
                    <TextField
                      label=""
                      type="number"
                      min="0"
                      step="1"
                      value={row.lowStockThreshold}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          variantRows: form.variantRows.map((r, j) =>
                            j === i ? { ...r, lowStockThreshold: e.target.value } : r
                          ),
                        })
                      }
                      placeholder="5"
                    />
                  </div>
                ))}
                <p className="text-[12px] leading-snug text-text-secondary">
                  Sizes come from the Variants tab. The shop stops selling a size
                  once its own count hits zero.
                </p>
              </div>
            ) : form.trackInventory ? (
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
            ) : null}
          </div>
        )}

        {/* ── Media ── */}
        {tab === 'media' && (() => {
          const currentMedia = mediaTab === 'base' ? {
            imageUrl: form.imageUrl,
            images: form.images,
            videoUrl: form.videoUrl,
          } : {
            imageUrl: form.variantRows[mediaTab as number]?.imageUrl || '',
            images: form.variantRows[mediaTab as number]?.images || [],
            videoUrl: form.variantRows[mediaTab as number]?.videoUrl || '',
          };

          const setUrlField = (field: 'imageUrl' | 'videoUrl') => (val: string) => {
            if (mediaTab === 'base') setForm({ ...form, [field]: val });
            else
              setForm({
                ...form,
                variantRows: form.variantRows.map((r, i) =>
                  i === mediaTab ? { ...r, [field]: val } : r
                ),
              });
          };

          const mediaSummary = (m: { imageUrl: string; images: ImageEntry[]; videoUrl: string }) => {
            const photos = (m.imageUrl ? 1 : 0) + m.images.length;
            const parts: string[] = [];
            if (photos > 0) parts.push(`${photos} photo${photos === 1 ? '' : 's'}`);
            if (m.videoUrl) parts.push('video');
            return parts.length ? parts.join(' · ') : 'No media';
          };

          const switcherCard = (
            key: string,
            label: string,
            media: { imageUrl: string; images: ImageEntry[]; videoUrl: string },
            active: boolean,
            onClick: () => void
          ) => {
            const summary = mediaSummary(media);
            return (
              <button
                key={key}
                type="button"
                onClick={onClick}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                  active
                    ? 'border-lume-accent/50 bg-lume-accent/[0.06] ring-1 ring-lume-accent/40'
                    : 'border-black/10 bg-[#FCF8EF] hover:border-lume-accent/30'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.06] bg-white/70">
                  {media.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={media.imageUrl} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-4 w-4 text-text-secondary/40" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-text-primary">
                    {label}
                  </span>
                  <span
                    className={`block text-[11px] ${
                      summary === 'No media' ? 'font-medium text-amber-700' : 'text-text-secondary'
                    }`}
                  >
                    {summary}
                  </span>
                </span>
              </button>
            );
          };

          return (
            <div className="grid gap-6">
              {/* Whose media am I editing? */}
              {form.variantRows.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {switcherCard(
                    'base',
                    'Base Product',
                    { imageUrl: form.imageUrl, images: form.images, videoUrl: form.videoUrl },
                    mediaTab === 'base',
                    () => setMediaTab('base')
                  )}
                  {form.variantRows.map((r, idx) =>
                    switcherCard(
                      r.id ?? `size-${idx}`,
                      r.label || `Size ${idx + 1}`,
                      { imageUrl: r.imageUrl, images: r.images, videoUrl: r.videoUrl },
                      mediaTab === idx,
                      () => setMediaTab(idx)
                    )
                  )}
                </div>
              )}

              {/* Primary image */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  Primary Image
                </label>
                <p className="mb-2.5 text-[12px] text-text-secondary">
                  The lead shot — shown on {mediaTab === 'base' ? 'the shop grid and product page' : 'this size’s tile and gallery'}.
                </p>
                <div className="flex items-start gap-4">
                  <label className="group/primary relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white/70 transition-colors hover:border-lume-accent/50">
                    {currentMedia.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentMedia.imageUrl}
                          alt=""
                          className="h-full w-full object-contain p-2"
                        />
                        <span className="absolute inset-x-0 bottom-0 hidden items-center justify-center gap-1 bg-lume-house/80 py-1.5 text-[11px] font-semibold text-white group-hover/primary:flex">
                          <Upload className="h-3 w-3" /> Replace
                        </span>
                      </>
                    ) : (
                      <span className="flex flex-col items-center gap-1.5 text-text-secondary">
                        <Upload className="h-5 w-5" />
                        <span className="text-[11px] font-medium">
                          {uploading ? 'Uploading…' : 'Upload'}
                        </span>
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={onPrimaryImage}
                    />
                  </label>
                  <div className="flex w-full max-w-xs flex-col gap-2">
                    <TextField
                      value={currentMedia.imageUrl}
                      onChange={(e) => setUrlField('imageUrl')(e.target.value)}
                      placeholder="Or paste an image URL"
                    />
                    {currentMedia.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setUrlField('imageUrl')('')}
                        className="self-start text-[12px] font-medium text-text-secondary hover:text-red-600"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Image variations */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
                  Image Variations
                </label>
                <p className="mb-2.5 text-[12px] text-text-secondary">
                  Angles, close-ups or lifestyle shots — drag tiles to reorder the gallery.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {currentMedia.images.map((img, idx) => (
                    <div
                      key={`${img.url}-${idx}`}
                      draggable
                      onDragStart={() => setDragIdx(idx)}
                      onDragEnd={() => setDragIdx(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragIdx !== null) moveImage(dragIdx, idx);
                        setDragIdx(null);
                      }}
                      className={`group relative h-24 w-24 cursor-grab overflow-hidden rounded-xl border bg-white/70 transition-all active:cursor-grabbing ${
                        dragIdx === idx
                          ? 'border-lume-accent/60 opacity-50'
                          : 'border-black/10 hover:border-lume-accent/40'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt ?? ''}
                        className="pointer-events-none h-full w-full object-contain p-1.5"
                      />
                      <span className="absolute left-1 top-1 rounded-md bg-lume-house/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
                        {idx + 2}
                      </span>
                      <span className="absolute bottom-1 left-1 hidden text-white drop-shadow group-hover:block">
                        <GripVertical className="h-3.5 w-3.5" />
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute right-1 top-1 hidden rounded-full bg-red-500 p-1 text-white shadow group-hover:flex"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/[0.15] text-text-secondary transition-colors hover:border-lume-accent/40 hover:text-lume-accent">
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] font-medium">{uploading ? 'Uploading…' : 'Add'}</span>
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
                <p className="mb-2.5 text-[12px] text-text-secondary">
                  Shown at the end of the gallery with a play button.
                </p>
                {currentMedia.videoUrl ? (
                  <div className="flex items-start gap-4">
                    <video
                      key={currentMedia.videoUrl}
                      src={currentMedia.videoUrl}
                      controls
                      muted
                      playsInline
                      className="h-32 w-48 shrink-0 rounded-xl border border-black/10 bg-black/5 object-contain"
                    />
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-full border border-black/[0.12] bg-[#FCF8EF] px-3.5 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:border-lume-accent/40">
                        <Video className="h-4 w-4" />
                        {uploading ? 'Uploading…' : 'Replace video'}
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={onVideo}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setUrlField('videoUrl')('')}
                        className="self-start text-[12px] font-medium text-text-secondary hover:text-red-600"
                      >
                        Remove video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
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
                    <div className="w-full max-w-xs">
                      <TextField
                        value={currentMedia.videoUrl}
                        onChange={(e) => setUrlField('videoUrl')(e.target.value)}
                        placeholder="Or paste a video URL"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Dynamic attributes ── */}
        {tab === 'details' && (
          <div className="grid gap-8">
            {/* Producer / Maker */}
            <div className="rounded-xl border border-black/[0.08] p-5">
              <h3 className="mb-1 text-[13px] font-semibold text-text-primary">Producer / Maker</h3>
              <p className="mb-4 text-[12px] text-text-secondary">
                Who makes this product - shown under the &ldquo;Producer / Maker&rdquo; tab with an optional photo.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Producer name"
                  value={form.producerName}
                  onChange={(e) => setForm({ ...form, producerName: e.target.value })}
                  placeholder="e.g. Charles Chocolates"
                />
                <TextField
                  label="Location"
                  value={form.producerLocation}
                  onChange={(e) => setForm({ ...form, producerLocation: e.target.value })}
                  placeholder="e.g. Port of Spain, Trinidad"
                />
                <div className="sm:col-span-2">
                  <TextArea
                    label="Producer story"
                    value={form.producerText}
                    onChange={(e) => setForm({ ...form, producerText: e.target.value })}
                    placeholder="Tell the story behind this maker…"
                    rows={4}
                  />
                </div>
                <SectionImagePicker
                  label="Producer photo"
                  url={form.producerImageUrl}
                  uploading={uploading}
                  onPick={onSectionImage('producerImageUrl')}
                  onClear={() => setForm({ ...form, producerImageUrl: '' })}
                />
              </div>
            </div>

            {/* Ingredients & Nutrition */}
            <div className="rounded-xl border border-black/[0.08] p-5">
              <h3 className="mb-1 text-[13px] font-semibold text-text-primary">
                Ingredients &amp; Nutrition
              </h3>
              <p className="mb-4 text-[12px] text-text-secondary">
                Ingredient list and nutrition info - or upload a photo of the label.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextArea
                    label="Ingredients & nutrition"
                    value={form.ingredientsText}
                    onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })}
                    placeholder="e.g. Raisins, milk chocolate (sugar, cocoa butter, milk solids)…"
                    rows={4}
                  />
                </div>
                <SectionImagePicker
                  label="Label photo"
                  url={form.ingredientsImageUrl}
                  uploading={uploading}
                  onPick={onSectionImage('ingredientsImageUrl')}
                  onClear={() => setForm({ ...form, ingredientsImageUrl: '' })}
                />
              </div>
            </div>

            {/* Storage Guide */}
            <div className="rounded-xl border border-black/[0.08] p-5">
              <h3 className="mb-1 text-[13px] font-semibold text-text-primary">Storage Guide</h3>
              <p className="mb-4 text-[12px] text-text-secondary">
                How to keep it fresh - text, a photo, or both.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <TextArea
                    label="Storage guide"
                    value={form.storageText}
                    onChange={(e) => setForm({ ...form, storageText: e.target.value })}
                    placeholder="e.g. Store in a cool, dry place. Refrigerate after opening."
                    rows={3}
                  />
                </div>
                <SectionImagePicker
                  label="Storage photo"
                  url={form.storageImageUrl}
                  uploading={uploading}
                  onPick={onSectionImage('storageImageUrl')}
                  onClear={() => setForm({ ...form, storageImageUrl: '' })}
                />
              </div>
            </div>
          </div>
        )}

        {tab === 'attributes' && (
          <div>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
              {isHome ? 'Home & retail attributes' : 'Food & pantry attributes'}
            </div>
            <p className="mb-3 text-[12px] text-text-secondary">
              {form.category
                ? isHome
                  ? 'Eco & material labels for Home & Kitchen items.'
                  : 'Dietary labels - shown as shop filters.'
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

            {/* Custom attributes: free-form labels shown as chips on the PDP */}
            <div className="mt-6 border-t border-black/10 pt-5">
              <div className="mb-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-text-secondary">
                Custom Attributes
              </div>
              <p className="mb-3 text-[12px] text-text-secondary">
                Add your own labels (e.g. “Fair Trade”, “Small Batch”) — shown with the
                attributes on the product page.
              </p>
              {form.customAttributes.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {form.customAttributes.map((attr) => (
                    <span
                      key={attr}
                      className="inline-flex items-center gap-1.5 rounded-full border border-lume-accent/30 bg-lume-accent/5 px-3 py-1.5 text-[12px] font-medium text-text-primary"
                    >
                      {attr}
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            customAttributes: form.customAttributes.filter(
                              (a) => a !== attr
                            ),
                          })
                        }
                        className="text-text-secondary hover:text-red-600"
                        aria-label={`Remove ${attr}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <TextField
                  value={customAttrInput}
                  onChange={(e) => setCustomAttrInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    const val = customAttrInput.trim();
                    if (!val || form.customAttributes.includes(val)) return;
                    setForm({
                      ...form,
                      customAttributes: [...form.customAttributes, val],
                    });
                    setCustomAttrInput('');
                  }}
                  placeholder="Type an attribute and press Enter…"
                />
                <Btn
                  variant="ghost"
                  onClick={() => {
                    const val = customAttrInput.trim();
                    if (!val || form.customAttributes.includes(val)) return;
                    setForm({
                      ...form,
                      customAttributes: [...form.customAttributes, val],
                    });
                    setCustomAttrInput('');
                  }}
                >
                  <Plus className="h-4 w-4" /> Add
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── Variants (sizes with per-size case pricing) ── */}
        {tab === 'variants' && (
          <div className="grid gap-4">
            <p className="text-[12px] leading-snug text-text-secondary">
              Add each purchasable size (e.g. “250ml One Way Glass”, “2L PET”) with a
              photo, then set its ¼ / ½ / full case quantities and prices. Shoppers pick
              a size, then a case option — the photo swaps in and the price updates.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Option Name"
                value={form.optionName}
                onChange={(e) => setForm({ ...form, optionName: e.target.value })}
                placeholder="e.g. Size"
              />
              <TextField
                label="Unit Label"
                value={form.caseItemLabel}
                onChange={(e) => setForm({ ...form, caseItemLabel: e.target.value })}
                placeholder="e.g. bottle"
              />
            </div>

            {form.variantRows.map((row, i) => {
              const patchRow = (patch: Partial<VariantRowForm>) =>
                setForm({
                  ...form,
                  variantRows: form.variantRows.map((r, j) =>
                    j === i ? { ...r, ...patch } : r
                  ),
                });
              return (
                <div
                  key={row.id ?? `new-${i}`}
                  className="rounded-xl border border-[#E6DBC4] bg-[#FCF8EF]/60 p-4"
                >
                  {/* Header: image, active, delete */}
                  <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-3">
                    <div className="flex items-center gap-3">
                      <label className="relative flex h-14 w-14 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-black/15 bg-white/60 transition-colors hover:border-lume-accent">
                        {row.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.imageUrl}
                            alt={row.label || 'Variant'}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-text-secondary/50" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onVariantImage(i)}
                          disabled={uploading}
                        />
                      </label>
                      <div>
                        <span className="text-[13px] font-semibold text-text-primary">
                          {row.label.trim() || `Variant #${i + 1}`}
                        </span>
                        <p className="text-[11px] text-text-secondary">
                          Set a direct price or enable case options below.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CheckRow
                        label="Active"
                        checked={row.active}
                        onChange={(v) => patchRow({ active: v })}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            variantRows: form.variantRows.filter((_, j) => j !== i),
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label={`Remove ${row.label || 'variant'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Name and Direct Price Inputs */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <TextField
                        label="Variant / Size Name"
                        value={row.label}
                        onChange={(e) => patchRow({ label: e.target.value })}
                        placeholder="e.g. 6g Tumeric Powder"
                      />
                      {!row.label.trim() && (
                        <p className="mt-1 text-[11px] font-medium text-red-600">
                          Name this size — unnamed sizes are not saved.
                        </p>
                      )}
                    </div>

                    <div>
                      <TextField
                        label="Price (TTD)"
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.price}
                        onChange={(e) => patchRow({ price: e.target.value })}
                        placeholder="e.g. 15.00"
                      />
                    </div>
                  </div>

                  {/* Case options for this size */}
                  <div className="mt-3 flex flex-col gap-2.5 border-t border-black/10 pt-3">
                    <span className="text-[12px] font-medium text-text-primary">
                      Case Options, Quantity &amp; Pricing (TTD)
                    </span>
                    <div className="grid grid-cols-[6.5rem_1fr_1fr] items-center gap-3">
                      <CheckRow
                        label="¼ Case"
                        checked={row.enableQuarter}
                        onChange={(v) => patchRow({ enableQuarter: v })}
                      />
                      {row.enableQuarter ? (
                        <>
                          <TextField
                            label=""
                            type="number"
                            step="1"
                            min="1"
                            value={row.quarterQty}
                            onChange={(e) => patchRow({ quarterQty: e.target.value })}
                            placeholder="Qty per ¼ case"
                          />
                          <TextField
                            label=""
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.quarterPrice}
                            onChange={(e) => patchRow({ quarterPrice: e.target.value })}
                            placeholder="Price for ¼ case"
                          />
                        </>
                      ) : (
                        <div className="col-span-2" />
                      )}
                    </div>
                    <div className="grid grid-cols-[6.5rem_1fr_1fr] items-center gap-3">
                      <CheckRow
                        label="½ Case"
                        checked={row.enableHalf}
                        onChange={(v) => patchRow({ enableHalf: v })}
                      />
                      {row.enableHalf ? (
                        <>
                          <TextField
                            label=""
                            type="number"
                            step="1"
                            min="1"
                            value={row.halfQty}
                            onChange={(e) => patchRow({ halfQty: e.target.value })}
                            placeholder="Qty per ½ case"
                          />
                          <TextField
                            label=""
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.halfPrice}
                            onChange={(e) => patchRow({ halfPrice: e.target.value })}
                            placeholder="Price for ½ case"
                          />
                        </>
                      ) : (
                        <div className="col-span-2" />
                      )}
                    </div>
                    <div className="grid grid-cols-[6.5rem_1fr_1fr] items-center gap-3">
                      <CheckRow
                        label="Full Case"
                        checked={row.enableFull}
                        onChange={(v) => patchRow({ enableFull: v })}
                      />
                      {row.enableFull ? (
                        <>
                          <TextField
                            label=""
                            type="number"
                            step="1"
                            min="1"
                            value={row.fullQty}
                            onChange={(e) => patchRow({ fullQty: e.target.value })}
                            placeholder="Qty per full case"
                          />
                          <TextField
                            label=""
                            type="number"
                            step="0.01"
                            min="0"
                            value={row.fullPrice}
                            onChange={(e) => patchRow({ fullPrice: e.target.value })}
                            placeholder="Price for full case"
                          />
                        </>
                      ) : (
                        <div className="col-span-2" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div>
              <Btn
                variant="ghost"
                onClick={() =>
                  setForm({
                    ...form,
                    variantRows: [...form.variantRows, emptyVariantRow()],
                  })
                }
              >
                <Plus className="h-4 w-4" /> Add {form.optionName.trim() || 'Size'}
              </Btn>
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
   Stock status pill for the catalogue table (styled
   like StatusBadge). Quantities are edited in the
   product modal's Inventory tab.
   ──────────────────────────────────────────────── */
function StockPill({
  product,
  variantStock,
}: {
  product: Product;
  variantStock?: { hasVariants: boolean; anyOutOfStock: boolean; anyLow: boolean };
}) {
  const st = stockStatus(product);

  // Determine the worst-case status across the product + its variants.
  // If any variant is out of stock → show "warning" level on the pill.
  const hasVariantIssue = variantStock?.anyOutOfStock || variantStock?.anyLow;
  const variantOutOfStock = variantStock?.anyOutOfStock ?? false;
  const variantLow = variantStock?.anyLow ?? false;

  let label: string;
  let cls: string;
  let icon: React.ReactNode = null;

  if (!st.tracked && !variantStock?.hasVariants) {
    label = 'Not tracked';
    cls = 'bg-black/[0.05] text-text-secondary ring-black/10';
  } else if (st.soldOut || variantOutOfStock) {
    label = 'Out of stock';
    cls = 'bg-red-50 text-red-600 ring-red-600/20';
    icon = <AlertTriangle className="h-3 w-3" />;
  } else if (st.low || variantLow) {
    label = 'Low stock';
    cls = 'bg-amber-50 text-amber-700 ring-amber-600/20';
    icon = <AlertTriangle className="h-3 w-3" />;
  } else {
    label = 'In stock';
    cls = 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] ring-1 ring-inset ${cls}`}
    >
      {icon}
      {label}
    </span>
  );
}

/** Image upload field for a PDP detail section (photo kept as-is, no
 *  background removal). */
function SectionImagePicker({
  label,
  url,
  uploading,
  onPick,
  onClear,
}: {
  label: string;
  url: string;
  uploading: boolean;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
        {label}
      </label>
      <div className="flex items-center gap-3">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-20 w-28 rounded-xl border border-black/10 object-cover"
          />
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
        <Btn onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-4 w-4" /> {url ? 'Replace image' : 'Upload image'}
        </Btn>
        {url && (
          <Btn onClick={onClear}>
            <X className="h-4 w-4" /> Remove
          </Btn>
        )}
      </div>
    </div>
  );
}
