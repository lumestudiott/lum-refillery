import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';
import { getServerConvexUrl } from '@/lib/env';
import ProductDetailClient from './ProductDetailClient';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// Next.js requires ISR pages to define revalidate
export const revalidate = 60;

// Force static paths so we only fetch at runtime when new pages are requested
export const dynamicParams = true;

async function getProductBySku(sku: string) {
  const convex = new ConvexHttpClient(getServerConvexUrl());
  return await convex.query(api.products.getBySku, { sku });
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProductBySku(resolvedParams.slug);

  if (!product) {
    return { title: 'Product Not Found | Lumë Refillery' };
  }

  return {
    title: `${product.name} | Lumë Refillery`,
    description: product.description ?? `Shop ${product.name} at Lumë Refillery.`,
    openGraph: {
      title: product.name,
      description: product.description ?? `Shop ${product.name} at Lumë Refillery.`,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = await getProductBySku(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.imageUrl,
            "description": product.description,
            "sku": product.sku,
            "offers": {
              "@type": "Offer",
              "priceCurrency": "USD",
              "price": (product.basePriceCents / 100).toFixed(2),
              "availability": product.active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "Lumë Refillery"
              }
            }
          })
        }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
