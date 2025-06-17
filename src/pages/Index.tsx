
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductManager from '@/components/ProductManager';
import PackageBuilder from '@/components/PackageBuilder';
import { Wine, Package, FileText, BarChart3 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('products');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wine className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">OpenBar Pro</h1>
                <p className="text-gray-600">Professional Open Bar Service Configurator</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Custom Package Builder</p>
                <p className="text-lg font-semibold text-gray-900">Professional Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Configuration Dashboard</h2>
          <p className="text-gray-600">Manage products, create custom packages, and generate professional quotes for your open bar services.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Product Management</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Package Builder</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Product Catalog</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ProductManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Custom Package Builder</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PackageBuilder />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">© 2024 OpenBar Pro. Professional open bar service management.</p>
            <p className="text-sm text-gray-500 mt-2">Built for professional bartending services and event management.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
