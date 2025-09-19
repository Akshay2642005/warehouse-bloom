import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Eye, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { fetchItems } from '@/api/items';
import { useState } from 'react';
import { ItemDialog } from './ItemDialog';

export function ProductTable() {
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['items', page],
    queryFn: () => fetchItems({ page, pageSize: 10 })
  });

  const getStatusBadge = (stock: number) => {
    const reorderLevel = 10; // Default reorder level
    if (stock === 0) {
      return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Out of Stock</Badge>;
    } else if (stock <= reorderLevel) {
      return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="border-success text-success bg-success/10">In Stock</Badge>;
    }
  };

  const formatPrice = (priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-destructive">Error loading items</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Product Inventory</CardTitle>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Package className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm">{item.sku}</td>
                  <td className="py-4 px-4 font-medium">{item.name}</td>
                  <td className="py-4 px-4">{formatPrice(item.priceCents)}</td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${item.quantity <= 10 ? 'text-warning' : 'text-foreground'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(item.quantity)}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setShowDialog(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data && data.totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm">
              Page {page} of {data.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === data.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
      
      <ItemDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        item={selectedItem}
        onSuccess={() => {
          setShowDialog(false);
          setSelectedItem(null);
        }}
      />
    </Card>
  );
}