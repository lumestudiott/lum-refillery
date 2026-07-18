import { ConvexHttpClient } from 'convex/browser';
import { unstable_cache } from 'next/cache';
import { api } from '../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';
import { ShopProduct } from '@/components/shop/ProductCard';
import ShopPageClient from './ShopPageClient';
import { ShopCategoryId, normalizeCategory, normalizeSort } from './shopConfig';

export const revalidate = 60;

type ShopPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const getCatalogSnapshot = unstable_cache(
  async (category: ShopCategoryId, subcategory: string | undefined) => {
    const convex = new ConvexHttpClient(getServerConvexUrl());
    return await convex.query(api.products.listActiveSnapshot, {
      category: category === 'all' ? undefined : category,
      subcategory,
      limit: 60,
    });
  },
  ['shop-catalog-snapshot'],
  { revalidate: 60 }
);

async function searchCatalog(
  query: string,
  category: ShopCategoryId,
  subcategory: string | undefined
) {
  const convex = new ConvexHttpClient(getServerConvexUrl());
  return await convex.query(api.products.searchActive, {
    query,
    category: category === 'all' ? undefined : category,
    subcategory,
    limit: 60,
  });
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) ?? {};
  const initialCategory = normalizeCategory(firstParam(params.category));
  const initialSubcategory = firstParam(params.sub)?.slice(0, 80) || undefined;
  const initialQuery = firstParam(params.q)?.slice(0, 80) ?? '';
  const initialSort = normalizeSort(firstParam(params.sort));

  const products = initialQuery
    ? await searchCatalog(initialQuery, initialCategory, initialSubcategory)
    : await getCatalogSnapshot(initialCategory, initialSubcategory);

  return (
    <ShopPageClient
      key={`${initialCategory}:${initialSubcategory ?? ''}:${initialSort}`}
      initialProducts={products as ShopProduct[]}
      initialCategory={initialCategory}
      initialSubcategory={initialSubcategory}
      initialQuery={initialQuery}
      initialSort={initialSort}
    />
  );
}

