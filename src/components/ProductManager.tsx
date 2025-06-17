
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product, saveProducts, loadProducts, generateId } from '@/utils/localStorage';
import { exportProductsToCSV, importProductsFromCSV } from '@/utils/csvUtils';
import { Plus, Upload, FileDown, Trash2, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    unitPrice: '',
    description: '',
    category: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    setProducts(loadProducts());
  }, []);

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unitPrice) {
      toast({
        title: "Error",
        description: "Name and unit price are required",
        variant: "destructive"
      });
      return;
    }

    const productData: Product = {
      id: isEditing || generateId(),
      name: formData.name,
      unitPrice: parseFloat(formData.unitPrice),
      description: formData.description,
      category: formData.category
    };

    if (isEditing) {
      setProducts(prev => prev.map(p => p.id === isEditing ? productData : p));
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    } else {
      setProducts(prev => [...prev, productData]);
      toast({
        title: "Success",
        description: "Product added successfully"
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', unitPrice: '', description: '', category: '' });
    setIsEditing(null);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      unitPrice: product.unitPrice.toString(),
      description: product.description,
      category: product.category || ''
    });
    setIsEditing(product.id);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Product deleted successfully"
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedProducts = await importProductsFromCSV(file);
      setProducts(prev => [...prev, ...importedProducts]);
      toast({
        title: "Success",
        description: `Imported ${importedProducts.length} products`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import CSV file",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    exportProductsToCSV(products);
    toast({
      title: "Success",
      description: "Products exported to CSV"
    });
  };

  return (
    <div className="space-y-6">
      {/* Import/Export Controls */}
      <div className="flex flex-wrap gap-4">
        <div>
          <Input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
            id="csv-import"
          />
          <Label htmlFor="csv-import">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </span>
            </Button>
          </Label>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={products.length === 0}>
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Add/Edit Product Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Premium Vodka"
                  required
                />
              </div>
              <div>
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Spirits, Staff, Equipment"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed product description..."
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Product' : 'Add Product'}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products List */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Products ({products.length})</h3>
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No products added yet. Add your first product above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{product.name}</h4>
                        {product.category && (
                          <Badge variant="secondary">{product.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                      <p className="text-lg font-bold text-green-600">${product.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManager;
