import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
// import { fetchItems, createItemApi, updateItemByIdApi, deleteItemByIdApi } from "@/api/items";
// Example usage:
// useEffect(() => { fetchItems({ page: 1, pageSize: 10 }).then(setData).catch(console.error); }, []);
// const handleCreate = async () => { await createItemApi({ name, sku }); refetch(); };

const inventoryData = [
  {
    id: "SKU-001",
    name: "Wireless Bluetooth Headphones",
    category: "Electronics",
    stock: 45,
    reserved: 5,
    available: 40,
    reorderLevel: 20,
    location: "A-01-05",
    supplier: "TechSupply Co.",
    lastUpdated: "2024-01-15"
  },
  {
    id: "SKU-002",
    name: "Gaming Mechanical Keyboard",
    category: "Electronics",
    stock: 8,
    reserved: 2,
    available: 6,
    reorderLevel: 15,
    location: "A-02-03",
    supplier: "GameGear Ltd.",
    lastUpdated: "2024-01-14"
  },
  {
    id: "SKU-003",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    stock: 0,
    reserved: 0,
    available: 0,
    reorderLevel: 10,
    location: "B-01-02",
    supplier: "Office Solutions",
    lastUpdated: "2024-01-10"
  },
  {
    id: "SKU-004",
    name: "LED Desk Lamp",
    category: "Home & Garden",
    stock: 32,
    reserved: 3,
    available: 29,
    reorderLevel: 15,
    location: "B-03-01",
    supplier: "Light Works",
    lastUpdated: "2024-01-15"
  }
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const getStatusBadge = (stock: number, reorderLevel: number) => {
    if (stock === 0) {
      return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Out of Stock</Badge>;
    } else if (stock <= reorderLevel) {
      return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="border-success text-success bg-success/10">In Stock</Badge>;
    }
  };

  const filteredInventory = inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || item.category === selectedCategory)
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage your warehouse inventory and stock levels.</p>
          </div>
          <Button className="bg-primary-blue hover:bg-primary-blue-dark">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Inventory ({filteredInventory.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product ID</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Available</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 font-mono text-sm">{item.id}</td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-muted-foreground">Supplier: {item.supplier}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{item.category}</td>
                      <td className="py-4 px-4">
                        <div>
                          <span className={`font-medium ${item.stock <= item.reorderLevel ? 'text-warning' : 'text-foreground'}`}>
                            {item.stock}
                          </span>
                          <div className="text-xs text-muted-foreground">Reserved: {item.reserved}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-success">{item.available}</td>
                      <td className="py-4 px-4 font-mono text-sm text-muted-foreground">{item.location}</td>
                      <td className="py-4 px-4">{getStatusBadge(item.stock, item.reorderLevel)}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}