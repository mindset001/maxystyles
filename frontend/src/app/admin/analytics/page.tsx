"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <BarChart3 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">$45,230</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">1,234</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">89</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">2,456</span>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Sarah Johnson</span><span>$129.99</span></li>
              <li className="flex justify-between"><span>Michael Chen</span><span>$89.50</span></li>
              <li className="flex justify-between"><span>Emily Davis</span><span>$245.00</span></li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex justify-between"><span>Summer Dress</span><span>3 left</span></li>
              <li className="flex justify-between"><span>Denim Jacket</span><span>1 left</span></li>
              <li className="flex justify-between"><span>Sneakers</span><span>5 left</span></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
