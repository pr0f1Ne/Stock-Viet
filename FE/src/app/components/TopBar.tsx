import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, User, LogOut, AlertTriangle, PackageX, Clock, Loader2 } from "lucide-react"; // Thêm Loader2 cho hiệu ứng xoay
import { useNavigate } from "react-router";

interface Notification {
  id: string;
  type: "critical" | "overstock" | "low_stock";
  productName: string;
  sku: string;
  currentStock: number;
  message: string;
  time: string;
  read: boolean;
}

export function TopBar() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Trạng thái đang đăng xuất
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // --- LẤY THÔNG TIN USER TỪ LOCALSTORAGE ---
  const userStr = localStorage.getItem("user");
  const currentUser = userStr ? JSON.parse(userStr) : null;

  // --- HÀM XỬ LÝ ĐĂNG XUẤT CÓ KẾT NỐI API ---
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Cách viết này chiều lòng TypeScript 100%
      const headers: Record<string, string> = {};
      if (currentUser && currentUser.id) {
        headers["X-User-ID"] = String(currentUser.id);
      }
      
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        headers: headers
      });
      
    } catch (error) {
      console.error("Lỗi khi báo cáo logout cho Backend:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
      window.location.href = "/login"; 
    }
  };

  const notifications: Notification[] = [
    { id: "1", type: "critical", productName: "Wireless Mouse", sku: "SKU-001", currentStock: 5, message: "Critical stock level - Only 5 units remaining", time: "5 minutes ago", read: false, },
    { id: "2", type: "critical", productName: "USB-C Cable", sku: "SKU-024", currentStock: 3, message: "Critical stock level - Only 3 units remaining", time: "15 minutes ago", read: false, },
    { id: "3", type: "overstock", productName: "Phone Case", sku: "SKU-087", currentStock: 450, message: "Overstock alert - 450 units in inventory", time: "1 hour ago", read: false, },
    { id: "4", type: "low_stock", productName: "Laptop Stand", sku: "SKU-012", currentStock: 12, message: "Low stock warning - 12 units remaining", time: "2 hours ago", read: true, },
    { id: "5", type: "overstock", productName: "Bluetooth Speaker", sku: "SKU-156", currentStock: 380, message: "Overstock alert - 380 units in inventory", time: "3 hours ago", read: true, },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    navigate("/profile");
    setShowProfileDropdown(false);
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "critical": return <AlertTriangle className="w-5 h-5 text-[#ef4444]" />;
      case "overstock": return <PackageX className="w-5 h-5 text-[#f59e0b]" />;
      case "low_stock": return <Clock className="w-5 h-5 text-[#f59e0b]" />;
    }
  };

  const getNotificationBgColor = (type: Notification["type"]) => {
    switch (type) {
      case "critical": return "bg-red-50";
      case "overstock": return "bg-amber-50";
      case "low_stock": return "bg-amber-50";
    }
  };

  return (
    <div className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 fixed top-0 right-0 left-60 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search inventory, orders, SKUs..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationDropdownRef}>
          <button
            onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
            className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-[#ef4444] rounded-full flex items-center justify-center text-white text-xs font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotificationDropdown && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-[500px] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-slate-900 font-semibold">Notifications</h3>
                  <p className="text-xs text-slate-500">{unreadCount} unread notifications</p>
                </div>
                <button onClick={() => setShowNotificationDropdown(false)} className="text-slate-400 hover:text-slate-600">
                  <span className="text-xs">Mark all as read</span>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[400px]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => navigate("/inventory")}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getNotificationBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {notification.productName}
                          </p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-[#2563eb] rounded-full flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-1">{notification.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{notification.sku}</span>
                          <span className="text-xs text-slate-400">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-slate-200 bg-slate-50">
                <button
                  onClick={() => { navigate("/inventory"); setShowNotificationDropdown(false); }}
                  className="w-full text-center text-sm text-[#2563eb] font-medium hover:text-[#1e40af]"
                >
                  View All Inventory
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu - ĐÃ ĐƯỢC CẬP NHẬT HIỂN THỊ DỮ LIỆU THẬT */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
          >
            {/* Hiển thị Avatar của Google, nếu không có thì hiển thị chữ cái đầu của Tên */}
            {currentUser?.picture ? (
              <img src={currentUser.picture} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                {currentUser?.name?.charAt(0) || "U"}
              </div>
            )}
            
            <div className="text-right hidden md:block">
              <p className="text-sm text-slate-900 font-medium truncate max-w-[120px]">{currentUser?.name || "Người dùng"}</p>
              <p className="text-xs text-slate-500 truncate max-w-[120px]">{currentUser?.email || "Chưa đăng nhập"}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-lg py-2 z-50">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
              </button>
              <div className="my-1 border-t border-slate-200"></div>
              
              {/* NÚT ĐĂNG XUẤT ĐÃ ĐƯỢC NỐI API */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
                <span>{isLoggingOut ? "Đang đăng xuất..." : "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}