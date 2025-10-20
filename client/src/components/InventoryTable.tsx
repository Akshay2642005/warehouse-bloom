import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Edit, Trash2, Package } from 'lucide-react';
import { axiosInstance } from '@/api/axiosInstance';

interface InventoryTableProps {
  searchTerm: string;
  statusFilter: string;
  sortBy: string;
}



export function InventoryTable({ searchTerm, statusFilter, sortBy }: InventoryTableProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory', searchTerm, statusFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams({
        pageSize: '50',
        ...(searchTerm && { q: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(sortBy && { sortBy })
      });
      const response = await axiosInstance.get(`/items?${params}`);
      return response.data.data;
    }
  });

  const items = data?.items || [];

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (quantity <= reorderLevel) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading inventory. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">SKU</th>
                <th className="text-left p-2">Category</th>
                <th className="text-left p-2">Stock</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.reorderLevel);
                return (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.supplier?.name || 'No supplier'}</div>
                      </div>
                    </td>
                    <td className="p-2 font-mono text-sm">{item.sku}</td>
                    <td className="p-2">{item.category?.name || 'Uncategorized'}</td>
                    <td className="p-2">
                      <div className="text-sm">
                        <div>{item.quantity} units</div>
                        <div className="text-muted-foreground">Reorder: {item.reorderLevel}</div>
                      </div>
                    </td>
                    <td className="p-2">{formatCurrency(item.priceCents)}</td>
                    <td className="p-2">
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}