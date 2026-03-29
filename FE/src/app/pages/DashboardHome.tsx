import React, { useState, useEffect } from "react";
import { InventoryHealthOverview } from "../components/InventoryHealthOverview";
import { CriticalAlerts } from "../components/CriticalAlerts";
import { TopBottomPerformers } from "../components/TopBottomPerformers";
import { ReorderRecommendations } from "../components/ReorderRecommendations"
import { CheckCircle2, X, Sparkles } from "lucide-react";

export function DashboardHome() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginSuccessPopup, setShowLoginSuccessPopup] = useState(false);
  const [userName, setUserName] = useState("Người dùng");

  // 1. Logic kiểm tra Popup và lấy Tên User
  useEffect(() => {
    const shouldShow = localStorage.getItem("showLoginSuccessNotify");
    const userStr = localStorage.getItem("user");
    
    if (userStr) {
      setUserName(JSON.parse(userStr).name);
    }
    
    if (shouldShow === "true") {
      setShowLoginSuccessPopup(true);
      localStorage.removeItem("showLoginSuccessNotify"); 
      
      const timer = setTimeout(() => setShowLoginSuccessPopup(false), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 2. Logic gọi API lấy dữ liệu Dashboard CÓ GẮN HEADER X-User-ID
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // --- TẠO HEADER CHỨA USER ID ---
        const userStr = localStorage.getItem("user");
        const headers: Record<string, string> = {};
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.id) {
            headers["X-User-ID"] = String(user.id);
          }
        }
        
        // 1. GỌI ĐÚNG VÀ ĐỦ 5 API CÙNG LÚC (Đã đính kèm headers)
        const [summaryRes, topRes, bottomRes, alertsRes, reorderRes] = await Promise.all([
          fetch("http://localhost:8000/api/summary", { headers }),
          fetch("http://localhost:8000/api/top-products", { headers }),
          fetch("http://localhost:8000/api/bottom-products", { headers }), 
          fetch("http://localhost:8000/api/critical-alerts", { headers }),
          fetch("http://localhost:8000/api/reorder-recommendations", { headers })
        ]);

        // 2. GIẢI MÃ DỮ LIỆU JSON
        const summaryData = await summaryRes.json();
        const topProductsData = await topRes.json();
        const bottomProductsData = await bottomRes.json(); 
        const alertsData = await alertsRes.json();
        const reordersData = await reorderRes.json();
        
        // 3. ĐÓNG GÓI VÀO KHO CHỨA
        setDashboardData({
          summary: summaryData,
          topProducts: topProductsData,
          bottomProducts: bottomProductsData, 
          alerts: alertsData,
          reorders: reordersData
        });
      } catch (error) {
        console.error("Lỗi kết nối Backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Dashboard</h1>
        {/* Đã sửa thành tên User động thay vì John */}
        <p className="text-sm text-slate-600">
          Xin chào, {userName}! Đây là tổng quan kho hàng của bạn ngày hôm nay.
        </p>
      </div>

      {loading ? (
        <div className="text-slate-500 animate-pulse">Đang đồng bộ dữ liệu...</div>
      ) : (
        <>
          <InventoryHealthOverview data={dashboardData?.summary} />
          
          <CriticalAlerts alertsData={dashboardData?.alerts} />
          
          {/* TRUYỀN CẢ TOP VÀ BOTTOM XUỐNG BẢNG */}
          <TopBottomPerformers 
            topData={dashboardData?.topProducts} 
            bottomData={dashboardData?.bottomProducts} 
          />
          
          <ReorderRecommendations reorderData={dashboardData?.reorders} />
        </>
      )}

      {/* POPUP THÔNG BÁO */}
      {showLoginSuccessPopup && (
        <div className="fixed top-20 right-8 z-50 animate-fade-in-down">
          <div className="bg-[#10b981] border border-[#059669] text-white p-5 rounded-2xl shadow-2xl flex items-start gap-4 w-[400px] relative overflow-hidden">
            <Sparkles className="absolute -bottom-2 -left-2 w-12 h-12 text-green-200/20" />
            <CheckCircle2 className="w-8 h-8 text-white flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-xl mb-1 flex items-center gap-2">
                Đăng nhập thành công!
              </h4>
              <p className="text-sm text-green-50 mb-1">
                Chào mừng {userName} trở lại SmartStock. 
              </p>
              <p className="text-sm font-semibold text-white">
                Bắt đầu quản lý kho ngay nào.
              </p>
            </div>
            <button
              onClick={() => setShowLoginSuccessPopup(false)}
              className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <style>{`
            @keyframes fade-in-down {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.5s ease-out; }
          `}</style>
        </div>
      )}
    </div>
  );
}