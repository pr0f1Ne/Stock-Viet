import { LineChart, Line, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calculator, Activity } from "lucide-react";
import { useState, useEffect } from "react";

export function AnalyticsPage() {
  const [selectedEoqProduct, setSelectedEoqProduct] = useState("");
  // State mới dành riêng cho biểu đồ Dự báo
  const [forecastSku, setForecastSku] = useState("all");
  
  const [salesForecastData, setSalesForecastData] = useState<any[]>([]);
  const [eoqDataList, setEoqDataList] = useState<any[]>([]);
  const [heatmapCategories, setHeatmapCategories] = useState<string[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // HÀM LẤY USER ID TỪ LOCALSTORAGE ĐỂ GỬI LÊN BACKEND
  const getUserHeader = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) headers["X-User-ID"] = String(user.id);
    }
    return headers;
  };

  // 1. TẢI DỮ LIỆU NỀN VÀ HEATMAP (Chạy 1 lần khi mở trang)
  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/api/eoq", { headers: getUserHeader() }),
      fetch("http://localhost:8000/api/heatmap", { headers: getUserHeader() })
    ])
    .then(async ([resEoq, resHeatmap]) => {
      const eoq = await resEoq.json();
      const heatmap = await resHeatmap.json();
      
      setEoqDataList(eoq);
      if(eoq.length > 0) setSelectedEoqProduct(eoq[0].sku); 
      
      setHeatmapCategories(heatmap.categories || []);
      setHeatmapData(heatmap.data || []);
      
      setIsInitialLoading(false);
    })
    .catch(err => {
      console.error("Lỗi fetch Analytics nền:", err);
      setIsInitialLoading(false);
    });
  }, []);

  // 2. TẢI DỮ LIỆU DỰ BÁO (Chạy lại mỗi khi bạn đổi Bộ lọc Sản phẩm)
  useEffect(() => {
    setIsForecastLoading(true);
    fetch(`http://localhost:8000/api/forecast?sku=${forecastSku}`, { headers: getUserHeader() })
      .then(res => res.json())
      .then(data => {
        setSalesForecastData(data);
        setIsForecastLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch Forecast:", err);
        setIsForecastLoading(false);
      });
  }, [forecastSku]);

  const currentEoq = eoqDataList.find(p => p.sku === selectedEoqProduct) || {
    annualDemand: 0, orderCost: 0, holdingCost: 1
  };
  
  const calculatedEOQ = currentEoq.annualDemand > 0 
    ? Math.sqrt((2 * currentEoq.annualDemand * currentEoq.orderCost) / currentEoq.holdingCost)
    : 0;

  const getHeatColor = (pct: number) => {
    if (pct >= 40) return "bg-[#10b981] text-white"; 
    if (pct >= 25) return "bg-[#14b8a6] text-white"; 
    if (pct >= 15) return "bg-[#f59e0b] text-white"; 
    return "bg-[#ef4444] text-white"; 
  };

  const isAnomaly = (pct: number) => pct >= 45;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Predictive Analytics</h1>
        <p className="text-sm text-slate-600">
          Advanced insights and optimization scenarios for inventory decision-making
        </p>
      </div>

      {/* Section 1: Sales Forecast (Đã thêm Bộ lọc) */}
      <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#2563eb]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Historical Sales vs Forecasted Demand</h3>
            <p className="text-sm text-slate-600">12-month prediction view based on AI Linear Regression</p>
          </div>
          
          {/* NÚT LỌC SẢN PHẨM CHO BIỂU ĐỒ DỰ BÁO */}
          <select
            value={forecastSku}
            onChange={(e) => setForecastSku(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm bg-white min-w-[220px]"
          >
            <option value="all">📊 All Products (Tổng công ty)</option>
            {eoqDataList.map((data) => (
              <option key={`forecast-${data.sku}`} value={data.sku}>
                {data.name} ({data.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="h-96 relative">
          {isForecastLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb]"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesForecastData}>
                <defs>
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Area type="monotone" dataKey="upperBound" stroke="none" fill="url(#colorConfidence)" name="Upper Bound" />
                <Area type="monotone" dataKey="lowerBound" stroke="none" fill="url(#colorConfidence)" name="Lower Bound" />
                <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', r: 5 }} name="Actual Sales" connectNulls />
                <Line type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ fill: '#8b5cf6', r: 4 }} name="Forecasted Demand" connectNulls />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Section 2: EOQ Calculator */}
      <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#f59e0b]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Economic Order Quantity (EOQ)</h3>
            <p className="text-sm text-slate-600">Optimal purchase quantity calculated from actual CSV data</p>
          </div>
          
          <select
            value={selectedEoqProduct}
            onChange={(e) => setSelectedEoqProduct(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-sm bg-white min-w-[220px]"
          >
            {eoqDataList.map((data) => (
              <option key={`eoq-${data.sku}`} value={data.sku}>
                {data.name} ({data.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded-lg p-5 border-l-4 border-[#2563eb]">
            <p className="text-sm text-slate-600 mb-1">Annual Demand (D)</p>
            <p className="text-3xl font-semibold text-slate-900">{currentEoq.annualDemand.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Dự báo số lượng bán cả năm</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-5 border-l-4 border-[#8b5cf6]">
            <p className="text-sm text-slate-600 mb-1">Order Cost (S)</p>
            <p className="text-3xl font-semibold text-slate-900">${currentEoq.orderCost}</p>
            <p className="text-xs text-slate-500 mt-1">Phí cố định mỗi lần đặt hàng</p>
          </div>
          <div className="bg-green-50 rounded-lg p-5 border-l-4 border-[#10b981]">
            <p className="text-sm text-slate-600 mb-1">Holding Cost (H)</p>
            <p className="text-3xl font-semibold text-slate-900">${currentEoq.holdingCost}</p>
            <p className="text-xs text-slate-500 mt-1">Phí lưu kho 1 sản phẩm / năm</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Optimal Reorder Quantity</p>
              <p className="text-4xl font-semibold text-slate-900">{Math.round(calculatedEOQ)} units</p>
              <p className="text-sm text-slate-600 mt-2">
                Nhập <strong className="text-slate-900">{Math.round(calculatedEOQ)} sản phẩm</strong> mỗi lần sẽ giúp tối ưu hóa 100% chi phí.
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Frequency</p>
              <p className="text-2xl font-semibold text-[#f59e0b]">
                {calculatedEOQ > 0 ? Math.ceil(currentEoq.annualDemand / calculatedEOQ) : 0}
              </p>
              <p className="text-xs text-slate-500 mt-1">lần đặt hàng / năm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Demand Pattern Heat Map */}
      <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#14b8a6]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Monthly Demand Distribution</h3>
            <p className="text-sm text-slate-600">Phân tích tỷ trọng doanh số (%) theo thời điểm trong tháng</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-[#ef4444]"></div><span className="text-slate-600">&lt;15%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-[#f59e0b]"></div><span className="text-slate-600">~15%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-[#14b8a6]"></div><span className="text-slate-600">~25%</span></div>
            <div className="flex items-center gap-1"><div className="w-4 h-4 rounded bg-[#10b981]"></div><span className="text-slate-600">&gt;40% (Peak)</span></div>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          {isInitialLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#14b8a6]"></div>
            </div>
          )}
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 border-b-2 border-slate-200">
                  Thời điểm
                </th>
                {heatmapCategories.map((category) => (
                  <th key={category} className="text-center py-3 px-4 text-sm font-semibold text-slate-700 border-b-2 border-slate-200">
                    {category}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heatmapData.length > 0 ? heatmapData.map((row) => (
                <tr key={row.week} className="border-b border-slate-100">
                  <td className="py-4 px-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                    {row.week}
                  </td>
                  {heatmapCategories.map((category) => {
                    const pctValue = row[category as keyof typeof row] as number;
                    const anomaly = isAnomaly(pctValue);
                    return (
                      <td key={category} className="py-3 px-4">
                        <div className="relative flex justify-center">
                          <div className={`${getHeatColor(pctValue)} px-3 py-2 rounded-lg text-sm font-semibold min-w-[70px] text-center relative transition-transform hover:scale-105 cursor-default`}>
                            {pctValue}%
                            {anomaly && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 border-2 border-white rounded-full animate-pulse" title="Doanh số bùng nổ"></span>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              )) : (
                <tr><td colSpan={7} className="py-8 text-center text-slate-500">Chưa có dữ liệu phân tích</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></span>
            Strategic Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border-l-4 border-slate-400 p-4 rounded-lg">
              <p className="text-sm text-slate-900 font-medium mb-1">Cách đọc biểu đồ Phần trăm (%)</p>
              <p className="text-xs text-slate-600">
                Nếu một mặt hàng bán đều đặn, mỗi tuần sẽ hiển thị mức ~25% (Màu xanh lơ). Bất cứ tuần nào vượt lên <strong>40%</strong> nghĩa là sản phẩm đó có xu hướng bùng nổ mạnh vào thời điểm đó trong tháng.
              </p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <p className="text-sm text-slate-900 font-medium mb-1">Cảnh báo Đột biến <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full ml-1"></span></p>
              <p className="text-xs text-slate-600">
                Các ô có chấm vàng nhấp nháy chỉ ra rằng danh mục đó chiếm <strong>hơn 45%</strong> doanh số cả tháng chỉ trong 1 tuần. Cần đẩy mạnh nhập hàng trước các tuần này để tránh đứt gãy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}