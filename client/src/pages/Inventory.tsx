import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/SearchInput";
import { Package, Filter, Plus, X } from "lucide-react";
import { InventoryTable } from '@/components/InventoryTable';
import { ItemDialog } from '@/components/ItemDialog';
import { useInstantSearch } from '@/hooks/useInstantSearch';



export default function Inventory() {
  const { searchTerm, setSearchTerm, debouncedTerm, clearSearch, isSearching } = useInstantSearch({
    debounceMs: 300,
    minSearchLength: 0
  });
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const clearFilters = () => {
    clearSearch();
    setStatusFilter("all");
    setSortBy("name");
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || sortBy !== "name";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Manage your warehouse inventory and stock levels.</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search by name, SKU, or description..."
                isSearching={isSearching}
                onClear={clearSearch}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-muted" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
            
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="sku">SKU</SelectItem>
                      <SelectItem value="quantity">Stock Level</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="updated">Last Updated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" className="flex-1" />
                    <Input placeholder="Max" type="number" className="flex-1" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <InventoryTable 
        searchTerm={debouncedTerm}
        statusFilter={statusFilter}
        sortBy={sortBy}
      />
      
      {/* Add Item Dialog */}
      <ItemDialog 
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={() => setShowDialog(false)}
      />
    </div>
  );
}
