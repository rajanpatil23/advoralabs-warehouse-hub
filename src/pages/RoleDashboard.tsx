import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "./Dashboard";
import ManagerDashboard from "./dashboards/ManagerDashboard";
import InventoryDashboard from "./dashboards/InventoryDashboard";
import DispatchDashboard from "./dashboards/DispatchDashboard";
import ViewerDashboard from "./dashboards/ViewerDashboard";

export default function RoleDashboard() {
  const { user } = useAuth();
  switch (user?.role) {
    case "Admin":             return <Dashboard />;
    case "Warehouse Manager": return <ManagerDashboard />;
    case "Inventory Staff":   return <InventoryDashboard />;
    case "Dispatch Operator": return <DispatchDashboard />;
    case "Viewer":            return <ViewerDashboard />;
    default:                  return <Dashboard />;
  }
}
