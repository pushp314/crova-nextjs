'use client';

import { useState } from 'react';
import { Search, Package, ShoppingCart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductSearch } from '@/components/admin/product-search';
import { OrderSearch } from '@/components/admin/order-search';
import { UserSearch } from '@/components/admin/user-search';

type SearchTab = 'products' | 'orders' | 'users';

export default function AdminSearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('products');

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Search className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Admin Search</h1>
        </div>
        <p className="text-muted-foreground">
          Search across products, orders, and users with advanced filters
        </p>
      </div>

      <div className="flex gap-2 mb-8 border-b">
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('products')}
          className="rounded-b-none"
        >
          <Package className="h-4 w-4 mr-2" />
          Products
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('orders')}
          className="rounded-b-none"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Orders
        </Button>
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
          className="rounded-b-none"
        >
          <Users className="h-4 w-4 mr-2" />
          Users
        </Button>
      </div>

      <div>
        {activeTab === 'products' && <ProductSearch />}
        {activeTab === 'orders' && <OrderSearch />}
        {activeTab === 'users' && <UserSearch />}
      </div>
    </div>
  );
}
