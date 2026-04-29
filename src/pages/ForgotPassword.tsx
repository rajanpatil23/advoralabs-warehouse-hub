import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    setSent(true);
    toast.success("Reset link sent");
  };

  return (
    <div className="min-h-screen w-full grid place-items-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Advora Labs</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">WMS Console</div>
          </div>
        </Link>

        {!sent ? (
          <>
            <h1 className="mt-10 text-2xl font-semibold tracking-tight">Reset your password</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter the email associated with your workspace and we'll send a reset link.
            </p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                Send reset link
              </Button>
            </form>
          </>
        ) : (
          <div className="mt-10 surface-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
              <MailCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Check your inbox</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>, you'll receive an email with reset instructions shortly.
            </p>
          </div>
        )}

        <Link to="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
