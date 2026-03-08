// Prefer production API by default; override with VITE_API_URL for local dev
export const API_BASE = import.meta.env.VITE_API_URL ?? "https://logs-online-api.onrender.com";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, opts);
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (!isJson) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Expected JSON response from API. Check VITE_API_URL.");
  }
  return res.json();
}

// Fire-and-forget warm-up ping to reduce first request latency on cold servers (e.g., Render free tier)
export async function warmBackend(timeoutMs = 6000): Promise<void> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Use a lightweight GET to /api/health
    await fetch(`${API_BASE}/api/health`, { cache: 'no-store', signal: controller.signal }).catch(() => {});
    clearTimeout(timer);
  } catch {
    // Ignore warm-up errors
  }
}

// ======== TYPE DEFINITIONS ========

interface SerialNumber {
  id: string;
  serial: string;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string; // Changed from Date to string to match component
}

interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  serialNumbers?: SerialNumber[];
  createdAt?: string; // Changed from Date to string
}

// Purchase history as returned by the backend
export interface PurchaseHistory {
  _id: string;
  userId: string;
  email: string;
  productId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  assignedSerials: string[];
  // Dates come over the wire as ISO strings
  purchaseDate: string;
}

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('admin_token');
};

// ======== CATALOG PRODUCT API ========

export const catalogAPI = {
  // Get all catalog products
  async getAll(): Promise<CatalogProduct[]> {
    return apiFetch('/api/catalog');
  },

  // Create a catalog product (admin only)
  async create(product: Omit<CatalogProduct, 'createdAt'>): Promise<CatalogProduct> {
    const token = getAdminToken();
    return apiFetch('/api/catalog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(product),
    });
  },

  // Update a catalog product (admin only)
  async update(id: string, updates: Partial<CatalogProduct>): Promise<CatalogProduct> {
    const token = getAdminToken();
    return apiFetch(`/api/catalog/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(updates),
    });
  },

  // Delete a catalog product (admin only)
  async delete(id: string): Promise<void> {
    const token = getAdminToken();
    return apiFetch(`/api/catalog/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
  },
};

// ======== PURCHASE HISTORY API ========

export const purchaseHistoryAPI = {
  // Get purchase history for a user
  async getByUserId(userId: string): Promise<PurchaseHistory[]> {
    return apiFetch(`/api/purchase-history/${userId}`);
  },

  // Create a purchase history entry
  async create(purchase: Omit<PurchaseHistory, '_id' | 'purchaseDate'>): Promise<PurchaseHistory> {
    return apiFetch('/api/purchase-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchase),
    });
  },

  // Get all purchase history (admin only) with optional email search
  async getAll(email?: string): Promise<PurchaseHistory[]> {
    const token = getAdminToken();
    const qs = email && email.trim().length > 0 ? `?email=${encodeURIComponent(email.trim())}` : "";
    return apiFetch(`/api/purchase-history${qs}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
  },

  // Complete purchase (deduct balance, update product, create history)
  async completePurchase(data: {
    userId: string;
    productId: string;
    quantity: number;
    serialUpdates?: SerialNumber[];
    purchaseData: Omit<PurchaseHistory, '_id' | 'purchaseDate'>;
  }): Promise<{ success: boolean; newBalance: number; purchase: PurchaseHistory; updatedProduct?: { id: string; serialNumbers?: SerialNumber[] } | null }> {
    return apiFetch('/api/purchase/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
  
  // Delete a purchase history entry (user-owned)
  // delete/restore removed; users cannot delete purchase history entries
};

// ======== CATALOG CATEGORIES API ========

export interface CatalogCategoryDTO {
  id: string;
  name: string;
  icon?: string;
  createdAt?: string;
}

export const catalogCategoriesAPI = {
  async getAll(): Promise<CatalogCategoryDTO[]> {
    return apiFetch('/api/catalog-categories');
  },
  async create(name: string, icon?: string): Promise<CatalogCategoryDTO> {
    const token = localStorage.getItem('admin_token');
    return apiFetch('/api/catalog-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ name, icon }),
    });
  },
  async update(id: string, data: { name?: string; icon?: string }): Promise<CatalogCategoryDTO> {
    const token = localStorage.getItem('admin_token');
    return apiFetch(`/api/catalog-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
  },
  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('admin_token');
    return apiFetch(`/api/catalog-categories/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
  }
};
