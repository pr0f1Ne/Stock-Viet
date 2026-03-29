import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  BarChart3
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";

export function Sidebar() {
  const location = useLocation();
  const [userName, setUserName] = useState("Người dùng");
  const [userInitials, setUserInitials] = useState("U");

  // Lấy thông tin user từ LocalStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.name) {
          setUserName(user.name);
          // Lấy 2 chữ cái đầu làm avatar (VD: Nguyễn Văn A -> NV)
          const initials = user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
          setUserInitials(initials);
        }
      } catch (err) {
        console.error("Lỗi đọc user:", err);
      }
    }
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Package, label: "Inventory", path: "/inventory" },
    { icon: TrendingUp, label: "Analytics", path: "/analytics" },
    { icon: ShoppingCart, label: "Orders", path: "/orders" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
  ];

  return (
    <div className="w-60 h-screen bg-[#1e293b] flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-lg font-semibold">SmartStock</h1>
            <p className="text-slate-400 text-xs">Inventory Optimizer</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-[#2563eb] text-white"
                      : "text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-full bg-[#2563eb] flex items-center justify-center text-white font-semibold shadow-md">
            {userInitials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-white text-sm font-medium truncate">{userName}</p>
            <p className="text-slate-400 text-xs">Quản lý kho</p>
          </div>
        </div>
      </div>
    </div>
  );
}