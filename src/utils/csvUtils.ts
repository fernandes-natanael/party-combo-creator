
import Papa from 'papaparse';
import { Product, Package, PackageItem } from './localStorage';

export const exportProductsToCSV = (products: Product[]): void => {
  const csv = Papa.unparse(products);
  downloadCSV(csv, 'products.csv');
};

export const importProductsFromCSV = (file: File): Promise<Product[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const products: Product[] = results.data.map((row: any) => ({
            id: row.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
            name: row.name || '',
            unitPrice: parseFloat(row.unitPrice) || 0,
            description: row.description || '',
            category: row.category || ''
          }));
          resolve(products);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const exportPackagesToCSV = (packages: Package[], products: Product[]): void => {
  const packageData = packages.map(pkg => {
    const totalPrice = calculatePackageTotal(pkg, products);
    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      totalPrice: totalPrice.toFixed(2),
      itemCount: pkg.items.length,
      createdAt: pkg.createdAt
    };
  });
  
  const csv = Papa.unparse(packageData);
  downloadCSV(csv, 'packages.csv');
};

const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const calculatePackageTotal = (pkg: Package, products: Product[]): number => {
  return pkg.items.reduce((total, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return total;
    
    const price = item.customPrice ?? product.unitPrice;
    return total + (price * item.quantity);
  }, 0);
};
