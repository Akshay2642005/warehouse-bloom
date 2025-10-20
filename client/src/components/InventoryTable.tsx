import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, Edit, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchItems, deleteItemByIdApi } from '@/api/items';
import { searchApi } from '@/api/search';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ItemDialog } from './ItemDialog';
import { useToast } from '@/hooks/use-toast';
import type { Item } from '@/types';

interface InventoryTableProps {
  searchTerm?: string;
  statusFilter?: string;
  sortBy?: string;
}

export function InventoryTable({ searchTerm = '', statusFilter = 'all', sortBy = 'name' }: InventoryTableProps) {
  const [page, setPage] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Reset page when search/filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['items', page, searchTerm, statusFilter, sortBy],
    queryFn: () => fetchItems({
      page,
      pageSize: 50,
      q: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy: sortBy !== 'name' ? sortBy : undefined
    }),
    retry: 1,
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemByIdApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({ title: 'Success', description: 'Item deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
    }
  });

  // Use server-side filtered data directly (no client-side filtering for performance)
  const items = data?.data?.items || data?.items || [];

  const getStatusBadge = useCallback((stock: number) => {
    const reorderLevel = 10;
    if (stock === 0) {
      return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Out of Stock</Badge>;
    } else if (stock <= reorderLevel) {
      return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="border-success text-success bg-success/10">In Stock</Badge>;
    }
  }, []);

  const formatPrice = useCallback((priceCents: number) => {
    return `$${(priceCents / 100).toFixed(2)}`;
  }, []);

  if (isLoading && !data) {
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
          <p className="text-destructive">Error loading inventory</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Inventory Management
          {isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <Button size="sm" onClick={() => setShowDialog(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Updated</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm">{item.sku}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl && (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={item.imageUrl} alt={item.name} />
                          <AvatarFallback>
                            <Package className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-medium">{formatPrice(item.priceCents)}</td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${item.quantity <= 10 ? 'text-warning' : 'text-foreground'}`}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(item.quantity)}</td>
                  <td className="py-4 px-4 text-muted-foreground text-sm">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(item); setShowDialog(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data && (data.data?.totalPages || data.totalPages) > 1 && items.length > 0 && (
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
              Page {page} of {data.data?.totalPages || data.totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === (data.data?.totalPages || data.totalPages)}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
        
        {items.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No items found matching your criteria.</p>
            {(searchTerm || statusFilter !== 'all') && (
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            )}
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