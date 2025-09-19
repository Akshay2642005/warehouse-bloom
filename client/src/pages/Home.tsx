import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Warehouse, 
  Package, 
  BarChart3, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Package,
      title: "Inventory Management",
      description: "Complete CRUD operations for all your warehouse items with real-time tracking"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time statistics and insights about your warehouse operations"
    },
    {
      icon: Shield,
      title: "Secure Authentication",
      description: "JWT-based authentication with role-based access control"
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Optimized with Redis caching and efficient database queries"
    },
    {
      icon: Users,
      title: "Multi-user Support",
      description: "Support for multiple users with different permission levels"
    },
    {
      icon: Warehouse,
      title: "Complete Solution",
      description: "Everything you need to manage your warehouse operations efficiently"
    }
  ];

  const benefits = [
    "Real-time inventory tracking",
    "Low stock alerts and notifications",
    "Comprehensive reporting and analytics",
    "User-friendly interface",
    "Secure data management",
    "Scalable architecture"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Warehouse className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-gray-900">Warehouse Bloom</h1>
                <p className="text-sm text-gray-500">Inventory Management System</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Warehouse
            <span className="text-blue-600"> Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your inventory operations with our comprehensive warehouse management system. 
            Track items, manage stock levels, and get real-time insights into your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Login to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Warehouse
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive solution provides all the tools you need for efficient warehouse operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Choose Warehouse Bloom?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Built with modern technologies and best practices, our system provides 
                reliability, security, and performance you can trust.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Uptime Guarantee</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-sm text-gray-600">System Monitoring</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-sm text-gray-600">Scalable Storage</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">⚡</div>
                <div className="text-sm text-gray-600">Lightning Fast</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Warehouse Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using Warehouse Bloom to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600">
                Login Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Warehouse className="h-5 w-5" />
              </div>
              <span className="ml-2 text-lg font-semibold">Warehouse Bloom</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Warehouse Bloom. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}