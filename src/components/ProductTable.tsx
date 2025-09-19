import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Edit, Eye } from "lucide-react";

const products = [
  {
    id: "SKU-001",
    name: "Wireless Headphones",
    category: "Electronics",
    stock: 45,
    reorderLevel: 20,
    status: "In Stock",
    location: "A-01-05"
  },
  {
    id: "SKU-002", 
    name: "Gaming Keyboard",
    category: "Electronics",
    stock: 8,
    reorderLevel: 15,
    status: "Low Stock",
    location: "A-02-03"
  },
  {
    id: "SKU-003",
    name: "Office Chair",
    category: "Furniture",
    stock: 0,
    reorderLevel: 10,
    status: "Out of Stock",
    location: "B-01-02"
  },
  {
    id: "SKU-004",
    name: "Desk Lamp",
    category: "Home & Garden",
    stock: 32,
    reorderLevel: 15,
    status: "In Stock",
    location: "B-03-01"
  },
  {
    id: "SKU-005",
    name: "Water Bottle",
    category: "Sports",
    stock: 12,
    reorderLevel: 25,
    status: "Low Stock",
    location: "C-01-04"
  }
];

export function ProductTable() {
  const getStatusBadge = (status: string, stock: number, reorderLevel: number) => {
    if (stock === 0) {
      return <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">Out of Stock</Badge>;
    } else if (stock <= reorderLevel) {
      return <Badge variant="outline" className="border-warning text-warning bg-warning/10">Low Stock</Badge>;
    } else {
      return <Badge variant="outline" className="border-success text-success bg-success/10">In Stock</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Product Inventory</CardTitle>
        <Button size="sm" className="bg-primary-blue hover:bg-primary-blue-dark">
          <Package className="h-4 w-4 mr-2" />
          Add Product
        </Button>
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
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-4 font-mono text-sm">{product.id}</td>
                  <td className="py-4 px-4 font-medium">{product.name}</td>
                  <td className="py-4 px-4 text-muted-foreground">{product.category}</td>
                  <td className="py-4 px-4">
                    <span className={`font-medium ${product.stock <= product.reorderLevel ? 'text-warning' : 'text-foreground'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-muted-foreground">{product.location}</td>
                  <td className="py-4 px-4">{getStatusBadge(product.status, product.stock, product.reorderLevel)}</td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
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
  );
}