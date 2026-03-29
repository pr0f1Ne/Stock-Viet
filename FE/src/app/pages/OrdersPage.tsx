import { useState, useEffect } from "react";
import { Package, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, Search, Filter } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
}

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // State lưu danh sách đơn hàng từ API
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy User ID để gửi xuống Backend
  const getUserHeader = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) headers["X-User-ID"] = String(user.id);
    }
    return headers;
  };

  // GỌI API LẤY DANH SÁCH ĐƠN HÀNG
  useEffect(() => {
    setIsLoading(true);
    fetch("http://localhost:8000/api/orders", { headers: getUserHeader() })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          setOrders([]); // Tránh sập UI nếu Backend báo lỗi
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi tải danh sách Orders:", err);
        setOrders([]);
        setIsLoading(false);
      });
  }, []);

  const getStatusBadge = (status: Order["status"]) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    const icons = {
      pending: <Clock className="w-3.5 h-3.5" />,
      processing: <Package className="w-3.5 h-3.5" />,
      shipped: <TrendingUp className="w-3.5 h-3.5" />,
      delivered: <CheckCircle className="w-3.5 h-3.5" />,
      cancelled: <XCircle className="w-3.5 h-3.5" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: Order["paymentStatus"]) => {
    const styles = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Orders</h1>
        <p className="text-sm text-slate-600">Track and manage your customer orders</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders or customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Payment</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Đang tải dữ liệu đơn hàng...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">Không tìm thấy đơn hàng nào!</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#2563eb]">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{order.customer}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{order.items}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm">{getPaymentBadge(order.paymentStatus)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}