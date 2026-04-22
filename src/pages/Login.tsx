import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, ShieldCheck, Activity, Boxes } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login, loginDemo } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("operator@connecttly.io");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      nav("/app");
    } finally {
      setLoading(false);
    }
  };

  const demo = () => {
    loginDemo("Admin");
    toast.success("Signed in as demo admin");
    nav("/app");
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Left: form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Connecttly</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">WMS Console</div>
            </div>
          </Link>

          <h1 className="mt-10 text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Welcome back. Manage every shipment, SKU, and bin from one console.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={demo}>
            Continue with demo access
          </Button>

          <p className="mt-6 text-xs text-muted-foreground text-center">
            Demo credentials are pre-filled. Any email/password works.
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-l border-border bg-gradient-surface">
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl" />

        <div className="relative max-w-md p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated/70 px-3 py-1 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Operations live across 4 warehouses
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight leading-tight">
            The modern <span className="text-gradient">warehouse command center</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Real-time inventory, intelligent inbound &amp; outbound flows, and analytics built for fast-moving operations teams.
          </p>

          <div className="mt-8 grid gap-3">
            {[
              { icon: Boxes, t: "Unified SKU catalog", d: "Track 100+ products with batch & expiry awareness." },
              { icon: Activity, t: "Live stock telemetry", d: "Inbound, outbound and transfer events in real time." },
              { icon: ShieldCheck, t: "Role-aware controls", d: "Admins, managers and operators — each see what matters." },
            ].map((f) => (
              <div key={f.t} className="flex items-start gap-3 rounded-lg border border-border bg-card/60 p-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{f.t}</div>
                  <div className="text-xs text-muted-foreground">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
