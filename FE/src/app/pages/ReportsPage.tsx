import { BarChart3, TrendingUp, Download, Calendar, FileText, DollarSign, Package, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

export function ReportsPage() {
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getUserHeader = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) headers["X-User-ID"] = String(user.id);
    }
    return headers;
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/reports", { headers: getUserHeader() })
      .then(res => res.json())
      .then(data => {
        setMonthlySales(data.monthlySales || []);
        setCategoryData(data.categoryData || []);
        setTopProducts(data.topProducts || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải Reports:", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div className="py-10 text-center text-slate-500">Đang tổng hợp báo cáo kinh doanh...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-1">Reports & Analytics</h1>
          <p className="text-sm text-slate-600">Comprehensive overview of your business performance</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50">
            <Calendar className="w-4 h-4" /> This Year
          </button>
          <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 12.5%
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-semibold text-slate-900">
            ${monthlySales.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 8.2%
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Orders</p>
          <p className="text-2xl font-semibold text-slate-900">
            {monthlySales.reduce((acc, curr) => acc + curr.orders, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-red-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 transform rotate-180" /> 3.1%
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Items Sold</p>
          <p className="text-2xl font-semibold text-slate-900">
            {topProducts.reduce((acc, curr) => acc + curr.sold, 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 15.3%
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-1">Net Profit</p>
          <p className="text-2xl font-semibold text-slate-900">
            ${monthlySales.reduce((acc, curr) => acc + (curr.profit || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue & Profit Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Sales by Category</h3>
          <div className="h-80 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ paddingLeft: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Top Performing Products</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900 w-16">Rank</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Product Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Units Sold</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Revenue</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? topProducts.map((product, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.sold} units</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">${product.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">${product.avgPrice.toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-6 text-center text-slate-500">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}