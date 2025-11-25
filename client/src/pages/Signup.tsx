import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signUp, createOrganization } from '@/lib/auth';
import { toast, useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { useOrganizationStore } from '@/stores/organization.store';
import { ThemeToggle } from "@/components/ThemeToggle";
import { Warehouse, Eye, EyeOff, ArrowRight, Check } from "lucide-react";

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    orgSlug: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser();
  const { setActiveOrg, setOrganizations, organizations } = useOrganizationStore();
  // Step 1: Register user with better-auth
  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name: string }) => {
      const result = await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      return result;
    },
    onSuccess: (result) => {
      // Better-auth auto-signs in the user if configured
      if (result.data) {
        // Fix type mismatch by handling null image and Date objects
        const user = {
          ...result.data.user,
          image: result.data.user.image || undefined,
          createdAt: result.data.user.createdAt.toISOString(),
          updatedAt: result.data.user.updatedAt.toISOString()
        };
        setUser(user);
        toast({
          title: "Account Created",
          description: "Now let's set up your organization"
        });
        setStep(2);
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error.message || "Registration failed",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive"
      });
    }
  });

  // Step 2: Create organization
  const createOrgMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      return await createOrganization(data);
    },
    onSuccess: (org: any) => {
      // IMPORTANT: Add organization to the organizations array AND set it as active
      if (org.data) {
        const newOrgData = org.data;
        const newOrg = {
          id: newOrgData.id,
          name: newOrgData.name,
          slug: newOrgData.slug,
          logo: newOrgData.logo || undefined,
          metadata: newOrgData.metadata,
          createdAt: newOrgData.createdAt.toString(),
          updatedAt: newOrgData.createdAt.toString(), // better-auth might not return updatedAt
          role: 'OWNER' as any
        };

        // Update both the organizations array and active org ID
        setOrganizations([...organizations, newOrg]);
        setActiveOrg(newOrgData.id);

        toast({
          title: "Success",
          description: "Your organization has been created!"
        });
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          title: "Error",
          description: "Failed to create organization data",
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Organization creation failed",
        variant: "destructive"
      });
    }
  });

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name
    });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.orgName || !formData.orgSlug) {
      toast({
        title: "Error",
        description: "Organization name and slug are required",
        variant: "destructive"
      });
      return;
    }

    createOrgMutation.mutate({
      name: formData.orgName,
      slug: formData.orgSlug
    });
  };

  // Auto-generate slug from organization name
  const handleOrgNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      orgName: name,
      orgSlug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }));
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
              {step === 1 ? "Create Your Account" : "Set Up Your Organization"}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
              {step === 1
                ? "Join thousands of businesses using Warehouse Bloom to manage their inventory efficiently."
                : "Your organization is where you'll manage inventory, team members, and settings."
              }
            </p>

            {/* Progress Steps */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 1 ? 'bg-yellow-500 text-black' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  } font-semibold`}>
                  {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Account</span>
              </div>
              <div className="h-0.5 w-16 bg-gray-300 dark:bg-gray-700"></div>
              <div className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${step >= 2 ? 'bg-yellow-500 text-black' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  } font-semibold`}>
                  2
                </div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">Organization</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-500">
          © 2024 Warehouse Bloom. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {step === 1 ? (
            // Step 1: Account Creation
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Your Account
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-yellow-600 dark:text-yellow-500 hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>

              <form onSubmit={handleStep1Submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 pr-10"
                      required
                      minLength={8}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 text-base font-medium"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? 'Creating Account...' : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : (
            // Step 2: Organization Setup
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Your Organization
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  This will be your workspace for managing inventory and team members.
                </p>
              </div>

              <form onSubmit={handleStep2Submit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="orgName" className="text-gray-700 dark:text-gray-300">
                    Organization Name
                  </Label>
                  <Input
                    id="orgName"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.orgName}
                    onChange={(e) => handleOrgNameChange(e.target.value)}
                    className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgSlug" className="text-gray-700 dark:text-gray-300">
                    Organization Slug
                  </Label>
                  <Input
                    id="orgSlug"
                    type="text"
                    placeholder="acme-inc"
                    value={formData.orgSlug}
                    onChange={(e) => setFormData(prev => ({ ...prev, orgSlug: e.target.value }))}
                    className="h-12 bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700"
                    required
                    pattern="[a-z0-9-]+"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Used in URLs. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    disabled={createOrgMutation.isPending}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 text-base font-medium"
                    disabled={createOrgMutation.isPending}
                  >
                    {createOrgMutation.isPending ? 'Creating...' : 'Complete Setup'}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}