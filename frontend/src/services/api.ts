const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('dropzone_token');
};

const buildHeaders = (withAuth = false): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ─── AUTH ──────────────────────────────────────────────────────────────────

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
};

// ─── PRODUCTS ──────────────────────────────────────────────────────────────

export const fetchProducts = async (params?: {
  category?: string;
  search?: string;
  page?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.page) query.set('page', String(params.page));

  const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
  return data;
};

export const fetchProductById = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Product not found');
  return data;
};

// ─── CART ──────────────────────────────────────────────────────────────────

export const fetchCart = async () => {
  const res = await fetch(`${API_BASE_URL}/cart`, {
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
  return data;
};

export const addItemToCart = async (productId: string, quantity: number, price: number) => {
  const res = await fetch(`${API_BASE_URL}/cart/add`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ productId, quantity, price }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to cart');
  return data;
};

// ─── ORDERS ────────────────────────────────────────────────────────────────

export const fetchMyOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
  return data;
};

export const fetchOrderById = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Order not found');
  return data;
};

// ─── ADMIN APIs ────────────────────────────────────────────────────────────

export const adminCreateProduct = async (productData: any) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
};

export const adminUpdateProduct = async (id: string, productData: any) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
};

export const adminDeleteProduct = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
};

export const adminFetchAllOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch all orders');
  return data;
};

export const adminUpdateOrderStatus = async (id: string, statusData: { status: string; trackingNumber?: string }) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: buildHeaders(true),
    body: JSON.stringify(statusData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update order status');
  return data;
};

export const adminForwardOrderToSupplier = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/forward`, {
    method: 'POST',
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to forward order to supplier');
  return data;
};

export const adminFetchCJProductDetails = async (id: string) => {
  const res = await fetch(`${API_BASE_URL}/cj/product/${id}`, {
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch CJ product details');
  return data;
};

export const adminImportCJProduct = async (cjProductId: string, priceMultiplier: number) => {
  const res = await fetch(`${API_BASE_URL}/cj/import`, {
    method: 'POST',
    headers: buildHeaders(true),
    body: JSON.stringify({ cjProductId, priceMultiplier }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to import CJ product');
  return data;
};

export const adminSyncCJVideos = async () => {
  const res = await fetch(`${API_BASE_URL}/cj/sync-videos`, {
    method: 'POST',
    headers: buildHeaders(true),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to sync videos');
  return data;
};
