// Realistic mock data for Connecttly WMS.
// Deterministic seed so dashboard numbers are stable across renders.

export type Warehouse = { id: string; code: string; name: string; city: string; country: string; capacity: number; used: number };
export type Supplier = { id: string; name: string; contact: string; email: string; phone: string; country: string; rating: number; status: "active" | "inactive"; orders: number };
export type Category = { id: string; name: string };

export type Product = {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  weightKg: number;
  price: number;
  cost: number;
  reorderLevel: number;
  safetyStock: number;
  supplierId: string;
  status: "active" | "draft" | "archived";
  batchTracked: boolean;
  expiryTracked: boolean;
  // Per-warehouse stock
  stock: Record<string, { available: number; reserved: number; damaged: number; inTransit: number; bin: string }>;
};

export type InboundShipment = {
  id: string;
  ref: string;
  supplierId: string;
  warehouseId: string;
  expectedDate: string;
  receivedDate?: string;
  status: "draft" | "expected" | "partial" | "received" | "closed";
  items: { productId: string; expected: number; received: number; damaged: number }[];
};

export type OutboundOrder = {
  id: string;
  ref: string;
  customer: string;
  city: string;
  warehouseId: string;
  date: string;
  status: "new" | "approved" | "picking" | "packed" | "dispatched" | "delivered" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  items: { productId: string; qty: number; picked: number }[];
  total: number;
};

export type Activity = { id: string; ts: string; user: string; action: string; module: string; detail: string };
export type Alert = { id: string; ts: string; severity: "info" | "warning" | "critical"; title: string; detail: string; module: string; read: boolean };

// --- Seeded RNG ---
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260422);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

// --- Warehouses ---
export const warehouses: Warehouse[] = [
  { id: "wh-1", code: "MUM-01", name: "Mumbai Central DC", city: "Mumbai", country: "IN", capacity: 12000, used: 8420 },
  { id: "wh-2", code: "BLR-02", name: "Bangalore Hub", city: "Bangalore", country: "IN", capacity: 9000, used: 5210 },
  { id: "wh-3", code: "DEL-03", name: "Delhi NCR Fulfilment", city: "Gurugram", country: "IN", capacity: 14000, used: 11800 },
  { id: "wh-4", code: "DXB-04", name: "Dubai Free Zone", city: "Dubai", country: "AE", capacity: 7000, used: 3150 },
];

// --- Categories ---
export const categories: Category[] = [
  { id: "cat-1", name: "Electronics" },
  { id: "cat-2", name: "Apparel" },
  { id: "cat-3", name: "Home & Kitchen" },
  { id: "cat-4", name: "Beauty" },
  { id: "cat-5", name: "Sports" },
  { id: "cat-6", name: "Industrial" },
];

// --- Suppliers ---
const supplierNames = [
  "Northwind Traders", "Acme Components", "Globex Distribution", "Initech Supply",
  "Hooli Logistics", "Stark Industries", "Wayne Enterprises", "Umbrella Goods",
  "Soylent Foods", "Pied Piper Tech", "Cyberdyne Systems", "Tyrell Manufacturing",
];
export const suppliers: Supplier[] = supplierNames.map((name, i) => ({
  id: `sup-${i + 1}`,
  name,
  contact: pick(["Aarav Mehta", "Priya Sharma", "Rohan Iyer", "Neha Kapoor", "Vikram Rao", "Sara Khan"]),
  email: name.toLowerCase().replace(/[^a-z]/g, "") + "@suppliers.io",
  phone: `+91 9${int(100000000, 999999999)}`,
  country: pick(["IN", "AE", "SG", "US", "DE", "CN"]),
  rating: Math.round((3.5 + rand() * 1.5) * 10) / 10,
  status: rand() > 0.15 ? "active" : "inactive",
  orders: int(8, 220),
}));

// --- Products (120 SKUs) ---
const brands = ["Nimbus", "Apex", "Lumen", "Forge", "Vertex", "Atlas", "Quanta", "Zenith", "Pulse", "Helix"];
const productBases: Record<string, string[]> = {
  Electronics: ["Wireless Earbuds", "USB-C Cable", "65W Charger", "Bluetooth Speaker", "Smart Bulb", "Power Bank 10K", "HDMI 2.1 Cable", "Mechanical Keyboard"],
  Apparel: ["Cotton T-Shirt", "Slim-fit Jeans", "Wool Sweater", "Running Shorts", "Linen Shirt", "Denim Jacket"],
  "Home & Kitchen": ["Ceramic Mug", "Cast Iron Pan", "Glass Tumbler Set", "Knife Block", "Coffee Grinder", "Vacuum Flask"],
  Beauty: ["Face Serum 30ml", "Vitamin C Cream", "Sunscreen SPF50", "Hair Oil 100ml", "Lip Balm Pack"],
  Sports: ["Yoga Mat 6mm", "Resistance Band Set", "Running Belt", "Dumbbell 5kg", "Cycling Bottle"],
  Industrial: ["M8 Hex Bolts 100pk", "Safety Gloves L", "Cable Tie 200mm", "Workshop Apron", "LED Floodlight 50W"],
};

export const products: Product[] = [];
let pIdx = 1;
for (const cat of categories) {
  const bases = productBases[cat.name] || ["Generic Item"];
  const count = cat.name === "Electronics" ? 30 : cat.name === "Apparel" ? 22 : 18;
  for (let i = 0; i < count; i++) {
    const brand = pick(brands);
    const base = pick(bases);
    const variant = pick(["", " — Black", " — White", " — Blue", " v2", " Pro", " Lite", " XL"]);
    const sku = `${cat.name.slice(0, 3).toUpperCase()}-${String(pIdx).padStart(4, "0")}`;
    const cost = int(50, 4500);
    const stock: Product["stock"] = {};
    for (const w of warehouses) {
      // not every product is in every warehouse
      if (rand() > 0.2) {
        const avail = int(0, 380);
        stock[w.id] = {
          available: avail,
          reserved: Math.max(0, int(0, 30)),
          damaged: rand() > 0.85 ? int(1, 8) : 0,
          inTransit: rand() > 0.8 ? int(5, 60) : 0,
          bin: `${pick(["A", "B", "C", "D"])}-${int(1, 12)}-${pick(["L", "M", "U"])}-${int(1, 4)}`,
        };
      }
    }
    products.push({
      id: `prd-${pIdx}`,
      sku,
      name: `${brand} ${base}${variant}`,
      barcode: `89${int(10000000000, 99999999999)}`,
      category: cat.name,
      brand,
      unit: pick(["pcs", "box", "set", "pair"]),
      weightKg: Math.round((0.05 + rand() * 4) * 100) / 100,
      price: Math.round(cost * (1.4 + rand() * 0.8)),
      cost,
      reorderLevel: int(20, 80),
      safetyStock: int(10, 40),
      supplierId: pick(suppliers).id,
      status: rand() > 0.08 ? "active" : rand() > 0.5 ? "draft" : "archived",
      batchTracked: cat.name === "Beauty" || cat.name === "Home & Kitchen",
      expiryTracked: cat.name === "Beauty",
      stock,
    });
    pIdx++;
  }
}

// --- Inbound shipments ---
const today = new Date();
const daysAgo = (n: number) => new Date(today.getTime() - n * 86400000).toISOString();
const daysAhead = (n: number) => new Date(today.getTime() + n * 86400000).toISOString();

export const inboundShipments: InboundShipment[] = Array.from({ length: 18 }).map((_, i) => {
  const items = Array.from({ length: int(2, 6) }).map(() => {
    const exp = int(20, 240);
    const received = pick([0, exp, Math.floor(exp * 0.6), exp]);
    return { productId: pick(products).id, expected: exp, received, damaged: rand() > 0.9 ? int(1, 4) : 0 };
  });
  const totalExp = items.reduce((s, x) => s + x.expected, 0);
  const totalRec = items.reduce((s, x) => s + x.received, 0);
  let status: InboundShipment["status"] = "expected";
  if (totalRec === 0) status = i % 5 === 0 ? "draft" : "expected";
  else if (totalRec < totalExp) status = "partial";
  else status = i % 4 === 0 ? "closed" : "received";
  return {
    id: `inb-${i + 1}`,
    ref: `GRN-2026-${String(1000 + i)}`,
    supplierId: pick(suppliers).id,
    warehouseId: pick(warehouses).id,
    expectedDate: i % 3 === 0 ? daysAhead(int(1, 10)) : daysAgo(int(1, 30)),
    receivedDate: status === "received" || status === "closed" || status === "partial" ? daysAgo(int(0, 20)) : undefined,
    status,
    items,
  };
});

// --- Outbound orders ---
const customers = ["Lyra Retail", "BlueOak Stores", "Metro Mart", "Sunrise Bazaar", "Pinnacle Trading", "Orbit Commerce", "Crestline Ltd", "Vanta Co.", "Harbor Goods", "Lumen Living"];
const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Pune", "Hyderabad", "Dubai", "Ahmedabad"];
export const outboundOrders: OutboundOrder[] = Array.from({ length: 24 }).map((_, i) => {
  const items = Array.from({ length: int(1, 5) }).map(() => {
    const qty = int(1, 25);
    return { productId: pick(products).id, qty, picked: pick([0, qty, Math.floor(qty / 2), qty]) };
  });
  const total = items.reduce((s, it) => {
    const p = products.find((x) => x.id === it.productId)!;
    return s + p.price * it.qty;
  }, 0);
  const statuses: OutboundOrder["status"][] = ["new", "approved", "picking", "packed", "dispatched", "delivered", "cancelled"];
  return {
    id: `out-${i + 1}`,
    ref: `SO-2026-${String(5000 + i)}`,
    customer: pick(customers),
    city: pick(cities),
    warehouseId: pick(warehouses).id,
    date: daysAgo(int(0, 25)),
    status: i < 3 ? "new" : statuses[int(0, statuses.length - 1)],
    priority: pick(["low", "normal", "normal", "high", "urgent"]),
    items,
    total,
  };
});

// --- Activities ---
const actionPool = [
  { module: "Inbound", action: "Received shipment" },
  { module: "Outbound", action: "Dispatched order" },
  { module: "Inventory", action: "Stock adjusted" },
  { module: "Transfers", action: "Transferred stock" },
  { module: "Products", action: "Created new SKU" },
  { module: "Users", action: "Updated role" },
];
const userPool = ["Aarav M.", "Priya S.", "Rohan I.", "Neha K.", "Vikram R."];
export const activities: Activity[] = Array.from({ length: 24 }).map((_, i) => {
  const a = pick(actionPool);
  return {
    id: `act-${i + 1}`,
    ts: daysAgo(rand() * 6),
    user: pick(userPool),
    action: a.action,
    module: a.module,
    detail: a.module === "Products" ? pick(products).sku : a.module === "Outbound" ? pick(outboundOrders).ref : pick(inboundShipments).ref,
  };
}).sort((a, b) => +new Date(b.ts) - +new Date(a.ts));

// --- Alerts ---
export const alerts: Alert[] = [
  ...products.filter((p) => {
    const total = Object.values(p.stock).reduce((s, x) => s + x.available, 0);
    return total > 0 && total < p.reorderLevel && p.status === "active";
  }).slice(0, 8).map((p, i) => ({
    id: `al-low-${i}`,
    ts: daysAgo(rand() * 3),
    severity: "warning" as const,
    title: `Low stock: ${p.name}`,
    detail: `${p.sku} below reorder level (${p.reorderLevel} ${p.unit})`,
    module: "Inventory",
    read: false,
  })),
  ...products.filter((p) => Object.values(p.stock).reduce((s, x) => s + x.available, 0) === 0 && p.status === "active").slice(0, 4).map((p, i) => ({
    id: `al-out-${i}`,
    ts: daysAgo(rand() * 2),
    severity: "critical" as const,
    title: `Stockout: ${p.name}`,
    detail: `${p.sku} has zero available stock across all warehouses`,
    module: "Inventory",
    read: false,
  })),
  ...inboundShipments.filter((s) => s.status === "expected" && new Date(s.expectedDate) < today).slice(0, 3).map((s, i) => ({
    id: `al-delay-${i}`,
    ts: daysAgo(rand() * 1),
    severity: "warning" as const,
    title: `Delayed inbound: ${s.ref}`,
    detail: `Expected ${new Date(s.expectedDate).toLocaleDateString()}, not yet received`,
    module: "Inbound",
    read: i > 0,
  })),
];

// --- Aggregates ---
export const totals = (() => {
  const totalSkus = products.length;
  let units = 0, value = 0, damaged = 0, lowStock = 0;
  for (const p of products) {
    let pTotal = 0;
    for (const w of Object.values(p.stock)) {
      units += w.available + w.reserved + w.inTransit;
      damaged += w.damaged;
      pTotal += w.available;
    }
    value += pTotal * p.cost;
    if (pTotal > 0 && pTotal < p.reorderLevel && p.status === "active") lowStock++;
  }
  const incoming = inboundShipments.filter((s) => s.status === "expected" || s.status === "partial").length;
  const outgoing = outboundOrders.filter((o) => ["new", "approved", "picking", "packed"].includes(o.status)).length;
  const dispatched = outboundOrders.filter((o) => o.status === "dispatched").length;
  const utilization = Math.round((warehouses.reduce((s, w) => s + w.used, 0) / warehouses.reduce((s, w) => s + w.capacity, 0)) * 100);
  const returns = 14;
  return { totalSkus, units, value, damaged, lowStock, incoming, outgoing, dispatched, utilization, returns };
})();

// --- Chart series ---
export const stockMovement30d = Array.from({ length: 30 }).map((_, i) => {
  const day = new Date(today.getTime() - (29 - i) * 86400000);
  return {
    date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    inbound: int(120, 480),
    outbound: int(140, 520),
  };
});

export const categoryDistribution = categories.map((c) => {
  const list = products.filter((p) => p.category === c.name);
  const units = list.reduce((s, p) => s + Object.values(p.stock).reduce((a, x) => a + x.available, 0), 0);
  return { name: c.name, value: units, count: list.length };
});

export const warehouseUtilizationData = warehouses.map((w) => ({
  name: w.code,
  used: w.used,
  free: w.capacity - w.used,
  pct: Math.round((w.used / w.capacity) * 100),
}));

// helpers
export const productById = (id: string) => products.find((p) => p.id === id);
export const supplierById = (id: string) => suppliers.find((s) => s.id === id);
export const warehouseById = (id: string) => warehouses.find((w) => w.id === id);

export function totalAvailable(p: Product) {
  return Object.values(p.stock).reduce((s, x) => s + x.available, 0);
}
export function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
