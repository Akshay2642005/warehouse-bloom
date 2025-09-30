import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface MFAVerificationProps {
  onVerify: (code: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function MFAVerification({ onVerify, onCancel, isLoading }: MFAVerificationProps) {
  const [code, setCode] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }
    onVerify(code);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
        <p className="text-center text-muted-foreground">
          Enter the 6-digit code from your authenticator app
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification Code</Label>
            <Input
              id="mfa-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="text-center text-lg tracking-widest"
              maxLength={6}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading || code.length !== 6}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}