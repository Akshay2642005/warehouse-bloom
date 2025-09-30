import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Warehouse, 
  Package, 
  BarChart3, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Globe
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: Package,
      title: "Smart Inventory",
      description: "AI-powered inventory management with predictive analytics and automated reordering",
      gradient: "from-gray-700 to-gray-800"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Advanced dashboards with live metrics and customizable reporting tools",
      gradient: "from-gray-600 to-gray-700"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with multi-factor authentication and encrypted data",
      gradient: "from-gray-800 to-gray-900"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Sub-second response times with global CDN and optimized infrastructure",
      gradient: "from-gray-700 to-gray-900"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless multi-user workflows with role-based permissions and notifications",
      gradient: "from-gray-600 to-gray-800"
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Multi-location support with centralized management and local compliance",
      gradient: "from-gray-700 to-gray-800"
    }
  ];

  const benefits = [
    "99.9% uptime with automatic failover",
    "AI-powered demand forecasting",
    "Real-time collaboration tools",
    "Mobile-first responsive design",
    "Enterprise-grade security",
    "Unlimited scalability"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1a1a]">
      {/* Header */}
      <header className="bg-white dark:bg-[#2a2a2a] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg">
                <Warehouse className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouse Bloom</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            AI-Powered Warehouse Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="text-gray-900 dark:text-white">
              Smart Inventory
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transform your warehouse operations with AI-powered insights, real-time analytics, and seamless automation. 
            Experience the future of inventory management today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black shadow-xl px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 text-lg">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for
              <span className="text-gray-900 dark:text-white"> Modern Teams</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience next-generation warehouse management with cutting-edge technology and intuitive design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 bg-white dark:bg-[#3a3a3a] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gray-50 dark:bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8">
                Why Industry Leaders Choose
                <span className="text-gray-900 dark:text-white"> Warehouse Bloom</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                Built with cutting-edge technology and enterprise-grade infrastructure, 
                delivering unmatched reliability, security, and performance.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-black shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-8 text-center bg-[#3a3a3a] text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <TrendingUp className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-gray-300">Uptime SLA</div>
              </Card>
              <Card className="p-8 text-center bg-[#3a3a3a] text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <Shield className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-gray-300">Security Monitor</div>
              </Card>
              <Card className="p-8 text-center bg-[#3a3a3a] text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <Globe className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <div className="text-4xl font-bold mb-2">150+</div>
                <div className="text-gray-300">Countries</div>
              </Card>
              <Card className="p-8 text-center bg-[#3a3a3a] text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
                <Zap className="h-8 w-8 mx-auto mb-4 text-yellow-500" />
                <div className="text-4xl font-bold mb-2">&lt;100ms</div>
                <div className="text-gray-300">Response Time</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#2a2a2a] relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            Join 10,000+ Happy Customers
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Revolutionize Your
            <br />Warehouse Operations?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your business with AI-powered inventory management. Start your free trial today 
            and experience the future of warehouse operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-yellow-500 text-black hover:bg-yellow-600 shadow-2xl px-10 py-4 text-lg font-semibold">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-600 text-white hover:bg-gray-800 px-10 py-4 text-lg">
                Watch Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg">
                <Warehouse className="h-7 w-7" />
              </div>
              <div className="ml-4">
                <span className="text-2xl font-bold text-gray-300">Warehouse Bloom</span>
                <p className="text-sm text-gray-400">Inventory Management</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-sm text-gray-400 mb-2">
                © 2024 Warehouse Bloom. All rights reserved.
              </div>
              <div className="text-xs text-gray-500">
                Built with ❤️ for modern businesses
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}