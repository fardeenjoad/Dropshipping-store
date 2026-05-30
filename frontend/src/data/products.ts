export interface Product {
  id: string | number;
  name: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  badge?: string;
  description: string;
  specs: { [key: string]: string };
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

export const ALL_PRODUCTS: Product[] = [];

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  ratings: number;
  numReviews: number;
  video?: string;
}

export const cleanStringValue = (val: string | undefined): string => {
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
          const formatted = str.replace(/'/g, '"').replace(/\\"/g, '"');
          const parsed = JSON.parse(formatted);
          if (Array.isArray(parsed) && parsed.length > 0) {
            str = String(parsed[0]).trim();
          }
        } catch {}
      }
    }
  } while (str !== prev);

  return str;
};

export const sanitizeUrl = (url: string | undefined): string => {
  if (!url) return '';
  const cleanUrl = cleanStringValue(url);
  if (cleanUrl.startsWith('//')) {
    return `https:${cleanUrl}`;
  }
  return cleanUrl;
};

export const toCardProduct = (p: ApiProduct): Product => ({
  id: p._id,
  name: cleanStringValue(p.name),
  image: sanitizeUrl(p.images?.[0] || '/product-1.png'),
  originalPrice: Math.round(p.price * 1.5),
  discountPrice: p.price,
  description: p.description,
  specs: { Category: p.category, Stock: String(p.stock) },
  video: p.video ? sanitizeUrl(p.video) : undefined,
});
