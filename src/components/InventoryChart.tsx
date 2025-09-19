import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Electronics", inStock: 450, lowStock: 23, outOfStock: 5 },
  { name: "Clothing", inStock: 320, lowStock: 45, outOfStock: 12 },
  { name: "Home & Garden", inStock: 280, lowStock: 18, outOfStock: 3 },
  { name: "Sports", inStock: 180, lowStock: 12, outOfStock: 2 },
  { name: "Books", inStock: 150, lowStock: 8, outOfStock: 1 },
  { name: "Toys", inStock: 120, lowStock: 15, outOfStock: 4 }
];

export function InventoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Inventory by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="inStock" stackId="a" fill="hsl(var(--primary-blue))" name="In Stock" />
            <Bar dataKey="lowStock" stackId="a" fill="hsl(var(--warning))" name="Low Stock" />
            <Bar dataKey="outOfStock" stackId="a" fill="hsl(var(--destructive))" name="Out of Stock" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}