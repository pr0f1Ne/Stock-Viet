import { Package, TrendingUp, TrendingDown, AlertCircle, DollarSign } from "lucide-react";

interface InventoryHealthProps {
  data?: any; // Dữ liệu từ file DashboardHome truyền xuống
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

// COMPONENT CON: GIỮ NGUYÊN 100% GIAO DIỆN CỦA BẠN
function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-slate-900 mb-2">{value}</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-[#10b981]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#ef4444]" />
            )}
            <span className={`text-sm ${isPositive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-slate-500">vs last month</span>
          </div>
        </div>
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// COMPONENT CHÍNH: ĐÃ ĐƯỢC BỌC BẢO VỆ CHỐNG UNDEFINED 100%
export function InventoryHealthOverview({ data }: InventoryHealthProps) {
  const metrics = [
    {
      title: "Total SKUs",
      // Dùng (data?.property ?? 0) để chắc chắn lúc nào cũng là số trước khi gọi toLocaleString()
      value: (data?.totalSkus ?? 0).toLocaleString(),
      change: 8,
      icon: <Package className="w-6 h-6 text-[#2563eb]" />,
      color: "bg-blue-50",
    },
    {
      title: "Items in Stock",
      value: (data?.itemsInStock ?? 0).toLocaleString(),
      change: 12,
      icon: <Package className="w-6 h-6 text-[#10b981]" />,
      color: "bg-green-50",
    },
    {
      title: "Low Stock Items",
      value: (data?.lowStockItems ?? 0).toLocaleString(),
      change: -23,
      icon: <AlertCircle className="w-6 h-6 text-[#f59e0b]" />,
      color: "bg-amber-50",
    },
    {
      title: "Out of Stock",
      value: (data?.outOfStock ?? 0).toLocaleString(),
      change: -45,
      icon: <AlertCircle className="w-6 h-6 text-[#ef4444]" />,
      color: "bg-red-50",
    },
    {
      title: "Inventory Value",
      value: `$${(data?.inventoryValue ?? 0).toLocaleString()}`,
      change: 15,
      icon: <DollarSign className="w-6 h-6 text-[#8b5cf6]" />,
      color: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} />
      ))}
    </div>
  );
}