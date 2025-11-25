import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Warehouse, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUser(data.user);
      toast({ title: "Success", description: "Logged in successfully" });
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#1a1a1a]">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 dark:bg-[#2a2a2a] relative overflow-hidden p-12 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center space-x-3 mb-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500 text-black shadow-lg">
              <Warehouse className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouse Bloom</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inventory Management</p>
            </div>
          </Link>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Intelligent Inventory Management for Your Business.
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Gain real-time insights, streamline operations, and drive growth with our powerful,
              multi-tenant inventory platform.
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-500">
          © 2024 Warehouse Bloom. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Sign In to Your Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="text-yellow-600 dark:text-yellow-500 hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                Email or Username
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 text-base font-medium"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
