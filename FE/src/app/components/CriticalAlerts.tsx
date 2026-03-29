import { AlertTriangle, Eye } from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "low" | "overstock";
  product: string;
  sku: string;
  message: string;
  currentStock: number;
  eoq?: number; // Đổi thành eoq
}

interface CriticalAlertsProps {
  alertsData?: any[]; 
}

export function CriticalAlerts({ alertsData }: CriticalAlertsProps) {
  
  // Lấy data và dùng trực tiếp 'status' từ Backend
  const alerts: Alert[] = alertsData && alertsData.length > 0 
    ? alertsData.map((apiAlert, index) => {
        const currentStock = apiAlert.currentStock || 0;
        
        // Ưu tiên lấy EOQ từ Backend, nếu không có thì tạm dùng recommendedStock
        const eoqValue = apiAlert.eoq || apiAlert.recommendedStock || 0;
        
        const type = (apiAlert.status || "low") as Alert["type"];

        let message = "";
        if (type === "critical") {
          message = currentStock === 0 
            ? "Out of stock - Đã hết sạch hàng trong kho!" 
            : `Critical Level - Chỉ còn đúng ${currentStock} sản phẩm!`;
        } else if (type === "overstock") {
          message = `Overstock detected - Tồn kho quá nhiều (Chậm luân chuyển)`;
        } else {
          message = `Low stock - Dưới mức an toàn (Nên nhập thêm ${eoqValue} sản phẩm theo EOQ)`;
        }

        return {
          id: apiAlert.sku || String(index),
          type,
          product: apiAlert.product || "Unknown Product",
          sku: apiAlert.sku || "N/A",
          message,
          currentStock,
          eoq: eoqValue,
        };
      })
    : [];

  return (
    <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
          Critical Alerts
        </h3>
        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
          {alerts.length} Action Required
        </span>
      </div>

      <div className="space-y-4">
        {alerts.length > 0 ? alerts.map((alert) => {
          const styles = {
            critical: { bg: "bg-red-50", border: "border-red-100", text: "text-red-700", dot: "bg-red-500", badge: "bg-red-100 text-red-700", badgeText: "Immediate Action" },
            low: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700", badgeText: "Restock Soon" },
            overstock: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700", dot: "bg-blue-500", badge: "bg-blue-100 text-blue-700", badgeText: "Review Pricing" }
          };
          const style = styles[alert.type];

          return (
            <div key={alert.id} className={`p-4 rounded-lg border ${style.bg} ${style.border}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${style.dot}`}></span>
                    <h4 className="text-sm font-semibold text-slate-900">{alert.product}</h4>
                    <span className="text-xs text-slate-500">SKU: {alert.sku}</span>
                    <span className={`px-2 py-1 text-xs rounded-md ${style.badge}`}>{style.badgeText}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span>Current: <strong className={style.text}>{alert.currentStock}</strong> units</span>
                    {/* Đã sửa phần hiển thị ở đây thành EOQ */}
                    {alert.type !== "overstock" && alert.eoq && alert.eoq > 0 ? (
                      <span>EOQ (Nên nhập): <strong>{alert.eoq}</strong> units</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs hover:bg-slate-50 transition-colors flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-4 text-center text-slate-500 text-sm">
            Hệ thống đang tải dữ liệu hoặc kho đang ở trạng thái an toàn tuyệt đối!
          </div>
        )}
      </div>
    </div>
  );
}