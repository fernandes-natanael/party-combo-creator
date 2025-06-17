
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Product, PackageItem, savePackages, loadPackages, loadProducts, generateId } from '@/utils/localStorage';
import { exportPackagesToCSV, calculatePackageTotal } from '@/utils/csvUtils';
import { exportPackagesToPDF } from '@/utils/pdfUtils';
import { Plus, FileDown, FileText, Trash2, Edit3, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PackageBuilder = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: [] as PackageItem[]
  });
  const { toast } = useToast();

  useEffect(() => {
    setPackages(loadPackages());
    setProducts(loadProducts());
  }, []);

  useEffect(() => {
    savePackages(packages);
  }, [packages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Package name and at least one item are required",
        variant: "destructive"
      });
      return;
    }

    const packageData: Package = {
      id: isEditing || generateId(),
      name: formData.name,
      description: formData.description,
      items: formData.items,
      createdAt: new Date().toISOString()
    };

    if (isEditing) {
      setPackages(prev => prev.map(p => p.id === isEditing ? packageData : p));
      toast({
        title: "Success",
        description: "Package updated successfully"
      });
    } else {
      setPackages(prev => [...prev, packageData]);
      toast({
        title: "Success",
        description: "Package created successfully"
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', items: [] });
    setIsEditing(null);
  };

  const addItem = () => {
    if (products.length === 0) {
      toast({
        title: "Error",
        description: "Please add products first",
        variant: "destructive"
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof PackageItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      items: pkg.items
    });
    setIsEditing(pkg.id);
  };

  const handleDelete = (id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Package deleted successfully"
    });
  };

  const calculateFormTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;
      
      const price = item.customPrice ?? product.unitPrice;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleExportCSV = () => {
    exportPackagesToCSV(packages, products);
    toast({
      title: "Success",
      description: "Packages exported to CSV"
    });
  };

  const handleExportPDF = () => {
    exportPackagesToPDF(packages, products);
    toast({
      title: "Success",
      description: "Packages exported to PDF"
    });
  };

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={handleExportCSV} disabled={packages.length === 0}>
          <FileDown className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button variant="outline" onClick={handleExportPDF} disabled={packages.length === 0}>
          <FileText className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Package Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Package' : 'Create New Package'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packageName">Package Name *</Label>
                <Input
                  id="packageName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Basic Party Package"
                  required
                />
              </div>
              <div>
                <Label>Estimated Total</Label>
                <div className="text-2xl font-bold text-green-600">
                  ${calculateFormTotal().toFixed(2)}
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="packageDescription">Description</Label>
              <Textarea
                id="packageDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Package description..."
                rows={3}
              />
            </div>

            {/* Package Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Package Items</Label>
                <Button type="button" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {formData.items.map((item, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Product</Label>
                        <Select 
                          value={item.productId} 
                          onValueChange={(value) => updateItem(index, 'productId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.unitPrice.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div>
                        <Label>Custom Price (optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.customPrice || ''}
                          onChange={(e) => updateItem(index, 'customPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="Override unit price"
                        />
                      </div>
                      
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => removeItem(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Package' : 'Create Package'}
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

      {/* Packages List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Created Packages ({packages.length})</h3>
        {packages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No packages created yet. Create your first package above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{pkg.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        {pkg.items.map((item, index) => {
                          const product = products.find(p => p.id === item.productId);
                          if (!product) return null;
                          
                          const price = item.customPrice ?? product.unitPrice;
                          const subtotal = price * item.quantity;
                          
                          return (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{product.name} × {item.quantity}</span>
                              <span>${subtotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Created: {new Date(pkg.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          Total: ${calculatePackageTotal(pkg, products).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg.id)}
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

export default PackageBuilder;
