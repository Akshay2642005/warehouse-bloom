import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser, verifyMFALogin } from "@/api/auth";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";
import { MFAVerification } from "@/components/MFAVerification";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showMFA, setShowMFA] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useUser();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.user.twoFactorEnabled) {
        setPendingUser(data);
        setShowMFA(true);
      } else {
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        toast({ title: "Success", description: "Logged in successfully" });
        navigate("/dashboard", { replace: true });
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.data?.requiresPayment) {
        toast({
          title: "Payment Required",
          description: "Please complete payment to activate your account.",
          variant: "destructive"
        });
        // Could redirect to payment page here
      } else {
        toast({
          title: "Error",
          description: errorData?.message || "Login failed",
          variant: "destructive"
        });
      }
    }
  });

  const mfaMutation = useMutation({
    mutationFn: async (code: string) => {
      return await verifyMFALogin(formData.email, code);
    },
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      toast({ title: "Success", description: "Logged in successfully" });
      navigate("/dashboard", { replace: true });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "MFA verification failed",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleMFAVerify = (code: string) => {
    mfaMutation.mutate(code);
  };

  const handleMFACancel = () => {
    setShowMFA(false);
    setPendingUser(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {showMFA ? (
        <MFAVerification
          onVerify={handleMFAVerify}
          onCancel={handleMFACancel}
          isLoading={mfaMutation.isPending}
        />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login to Warehouse Bloom</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>

            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

