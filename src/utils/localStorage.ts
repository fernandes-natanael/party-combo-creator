
export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  description: string;
  category?: string;
}

export interface PackageItem {
  productId: string;
  quantity: number;
  customPrice?: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  items: PackageItem[];
  createdAt: string;
}

const PRODUCTS_KEY = 'openbar_products';
const PACKAGES_KEY = 'openbar_packages';

// Product management
export const saveProducts = (products: Product[]): void => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const loadProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

// Package management
export const savePackages = (packages: Package[]): void => {
  localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
};

export const loadPackages = (): Package[] => {
  try {
    const stored = localStorage.getItem(PACKAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading packages:', error);
    return [];
  }
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
