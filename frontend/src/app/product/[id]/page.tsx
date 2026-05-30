import { Metadata } from "next";
import { ALL_PRODUCTS, Product } from "@/data/products";
import ProductDetailClient from "./ProductDetailClient";

interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  variants?: {
    sku: string;
    color?: string;
    size?: string;
    price: number;
    stock?: number;
    image?: string;
  }[];
  video?: string;
}

const cleanStringValue = (val: string | undefined): string => {
  if (!val) return '';
  let str = val.trim();
  
  const stripQuotes = (s: string): string => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1).trim();
    }
    return s;
  };

  let prev;
  do {
    prev = str;
    str = stripQuotes(str);
    if (str.startsWith('[') && str.endsWith(']')) {
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed) && parsed.length > 0) {
          str = String(parsed[0]).trim();
        }
      } catch {
        try {
          const formatted = str
            .replace(/'/g, '"')
            .replace(/\\"/g, '"');
          const parsed = JSON.parse(formatted);
          if (Array.isArray(parsed) && parsed.length > 0) {
            str = String(parsed[0]).trim();
          }
        } catch {
          // ignore
        }
      }
    }
  } while (str !== prev);

  return str;
};

const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  const cleanUrl = cleanStringValue(url);
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }
  return cleanUrl;
};

const toCardProduct = (p: ApiProduct): Product => ({
  id: p._id,
  name: cleanStringValue(p.name),
  image: sanitizeUrl(p.images?.[0] || '/product-1.png'),
  originalPrice: Math.round(p.price * 1.5),
  discountPrice: p.price,
  description: p.description,
  specs: { Category: p.category, Stock: String(p.stock) },
  variants: p.variants?.map(v => ({
    ...v,
    image: v.image ? sanitizeUrl(v.image) : undefined
  })),
  video: p.video ? sanitizeUrl(p.video) : undefined,
});

async function getProduct(idStr: string): Promise<Product | null> {
  // 1. Try finding in local mock data first
  if (/^\d+$/.test(idStr)) {
    const localProd = ALL_PRODUCTS.find(p => p.id === parseInt(idStr));
    if (localProd) return localProd;
  }

  // 2. Otherwise, fetch from backend DB
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${API_BASE_URL}/products/${idStr}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      const productData = data.product || data;
      if (productData) {
        return toCardProduct(productData);
      }
    }
  } catch (err) {
    console.error("Error fetching product details from DB", err);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return {
      title: "Product Not Found | DropZone",
      description: "This product does not exist in our catalog."
    };
  }

  return {
    title: `${product.name} | Buy Online | DropZone`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} | DropZone`,
      description: product.description.slice(0, 160),
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website'
    }
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <a href="/" className="text-blue-600 hover:underline">Return Home</a>
        </div>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, ...(product.variants?.map(v => v.image).filter(Boolean) as string[] || [])],
    "description": product.description,
    "sku": product.variants?.[0]?.sku || String(product.id),
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": product.variants && product.variants.length > 0 
        ? Math.min(...product.variants.map(v => v.price)) 
        : product.discountPrice,
      "highPrice": product.variants && product.variants.length > 0 
        ? Math.max(...product.variants.map(v => v.price)) 
        : product.discountPrice,
      "offerCount": product.variants && product.variants.length > 0 ? product.variants.length : 1,
      "price": product.discountPrice,
      "availability": parseInt(product.specs.Stock || '0') > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "89"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
