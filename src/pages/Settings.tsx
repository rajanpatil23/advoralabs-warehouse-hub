import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <PageHeader title="Settings" description="Workspace, inventory and notification preferences." />
      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="inventory">Inventory rules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <div className="surface-card p-6 max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Company name</Label><Input defaultValue="Advora Labs Pvt. Ltd." /></div>
              <div className="space-y-1.5"><Label>Workspace URL</Label><Input defaultValue="advoralabs.lovable.app" /></div>
              <div className="space-y-1.5"><Label>Primary contact</Label><Input defaultValue="ops@advoralabs.io" /></div>
              <div className="space-y-1.5"><Label>Currency</Label><Input defaultValue="INR" /></div>
            </div>
            <Button onClick={() => toast.success("Saved")} className="bg-gradient-primary text-primary-foreground">Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="mt-4">
          <div className="surface-card p-6 max-w-2xl space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Default reorder level</Label><Input type="number" defaultValue={30} /></div>
              <div className="space-y-1.5"><Label>Default safety stock</Label><Input type="number" defaultValue={15} /></div>
              <div className="space-y-1.5"><Label>Low stock warning %</Label><Input type="number" defaultValue={120} /></div>
              <div className="space-y-1.5"><Label>Cycle count interval (days)</Label><Input type="number" defaultValue={30} /></div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-sm font-medium">Auto-create reorder requests</div>
                <div className="text-xs text-muted-foreground">When stock falls below reorder level.</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => toast.success("Saved")} className="bg-gradient-primary text-primary-foreground">Save changes</Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="surface-card p-6 max-w-2xl space-y-3">
            {[
              ["Low stock alerts", true], ["Stockout alerts", true],
              ["Delayed shipment alerts", true], ["Pending dispatch reminders", false],
              ["Damaged stock notifications", true], ["Daily operations summary email", false],
            ].map(([label, def]) => (
              <div key={label as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="text-sm font-medium">{label}</div>
                <Switch defaultChecked={def as boolean} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <div className="surface-card p-6 max-w-2xl space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Theme</div>
              <div className="flex gap-2">
                {["light", "dark"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`rounded-lg border px-4 py-2 text-sm capitalize transition ${theme === t ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted/50"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
