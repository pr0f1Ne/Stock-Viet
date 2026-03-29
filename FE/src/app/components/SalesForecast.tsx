import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { useState } from "react";

interface SalesForecastProps {
  chartData?: any[];
}

export function SalesForecast({ chartData }: SalesForecastProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30");

  // 2. Nếu có data từ Python thì dùng, không thì dùng Mock data
  const data = chartData && chartData.length > 0 
    ? chartData.map(item => ({
        date: item.name,              // Tên tháng (Jan, Feb...)
        actual: item.total,           // Doanh thu thật
        forecast: item.total * 1.1,   // Giả lập đường dự báo (+10%)
        previousPeriod: item.total * 0.8 // Giả lập đường kỳ trước (-20%)
      }))
    : [
        { date: "Mar 1", actual: 2400, forecast: 2400, previousPeriod: 2100 },
        { date: "Mar 5", actual: 1398, forecast: 1900, previousPeriod: 1700 },
      ]; // (Giữ nguyên mảng mock cũ nếu muốn)

  return (
    <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#2563eb]" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Sales & Demand Forecasting</h3>
            <p className="text-sm text-slate-600">AI-powered predictions based on historical data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1 border border-slate-200 rounded-lg p-1">
            {(["7", "30", "90"] as const).map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === days
                    ? "bg-[#2563eb] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="previousPeriod"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="none"
              strokeDasharray="5 5"
              name="Previous Period"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#2563eb"
              strokeWidth={3}
              fill="url(#colorActual)"
              name="Actual Sales"
              dot={{ fill: '#2563eb', r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="forecast"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorForecast)"
              strokeDasharray="5 5"
              name="Forecasted"
              dot={{ fill: '#8b5cf6', r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-xs text-slate-600 mb-1">Avg Daily Sales</p>
          <p className="text-xl font-semibold text-slate-900">$4,242</p>
          <p className="text-xs text-[#10b981]">↑ 18% vs last period</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Forecast Accuracy</p>
          <p className="text-xl font-semibold text-slate-900">94.2%</p>
          <p className="text-xs text-slate-600">Last 30 days</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-1">Predicted Next Week</p>
          <p className="text-xl font-semibold text-slate-900">$36.5K</p>
          <p className="text-xs text-[#8b5cf6]">High confidence</p>
        </div>
      </div>
    </div>
  );
}
