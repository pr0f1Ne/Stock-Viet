import { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, Edit, Package, X, UploadCloud, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";

interface Product {
  id: string; image: string; sku: string; name: string; category: string;
  currentStock: number; unitCost: number; totalValue: number;
  reorderPoint: number; eoq: number; status: "critical" | "low" | "healthy" | "overstock"; supplier: string;
}

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false, message: '', type: 'success'
  });

  const [newProduct, setNewProduct] = useState({
    sku: "", name: "", category: "Electronics", stock: "" as string | number, unitCost: "" as string | number, supplier: "", imageUrl: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");

  const [filterOptions, setFilterOptions] = useState({
    categories: ["all"], suppliers: ["all"], statuses: ["all", "critical", "low", "healthy", "overstock"]
  });

  const getUserHeader = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.id) headers["X-User-ID"] = String(user.id);
    }
    return headers;
  };

  const showNotify = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // --- HÀM XÓA BỘ LỌC ---
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSupplierFilter("all");
  };

  useEffect(() => {
    fetch("http://localhost:8000/api/inventory/filters", { headers: getUserHeader() })
      .then(res => res.json())
      .then(data => setFilterOptions(data))
      .catch(err => console.error(err));
  }, [refreshKey]);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (categoryFilter !== "all") params.append("category", categoryFilter);
    if (statusFilter !== "all") params.append("status", statusFilter);
    if (supplierFilter !== "all") params.append("supplier", supplierFilter);

    const delay = setTimeout(() => {
      fetch(`http://localhost:8000/api/inventory?${params.toString()}`, { headers: getUserHeader() })
        .then(res => {
          if (!res.ok) throw new Error("Chưa đăng nhập hoặc phiên hết hạn!");
          return res.json();
        })
        .then(data => { 
          // FIX LỖI REDUCE Ở ĐÂY: Chỉ setProducts khi data là mảng
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            console.error("Dữ liệu trả về không phải là mảng:", data);
            setProducts([]); // Gán mảng rỗng để không sập web
          }
          setIsLoading(false); 
        })
        .catch(err => { 
          console.error(err); 
          setProducts([]); // Lỗi mạng cũng set mảng rỗng
          setIsLoading(false); 
        });
    }, 300);

    return () => clearTimeout(delay);
  }, [searchTerm, categoryFilter, statusFilter, supplierFilter, refreshKey]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        stock: newProduct.stock === "" ? 0 : Number(newProduct.stock),
        unitCost: newProduct.unitCost === "" ? 0 : Number(newProduct.unitCost),
        supplier: newProduct.supplier || "Không rõ",
        imageUrl: newProduct.imageUrl === "" ? null : newProduct.imageUrl
      };

      const apiUrl = isEditing 
        ? `http://localhost:8000/api/inventory/products/${newProduct.sku}`
        : "http://localhost:8000/api/inventory/products";
      const apiMethod = isEditing ? "PUT" : "POST";

      const res = await fetch(apiUrl, {
        method: apiMethod,
        headers: { "Content-Type": "application/json", ...getUserHeader() },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        throw new Error(errorMsg);
      }

      showNotify(isEditing ? "Đã cập nhật sản phẩm thành công!" : "Đã thêm sản phẩm thành công!", "success");
      handleCloseModal();
      setRefreshKey(old => old + 1);
    } catch (err: any) {
      showNotify(err.message, "error");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch("http://localhost:8000/api/upload-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Tải ảnh thất bại");
      const data = await res.json();
      setNewProduct({...newProduct, imageUrl: data.imageUrl});
    } catch (err) {
      console.error(err);
      showNotify("Lỗi khi tải ảnh lên máy chủ!", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setNewProduct({
      sku: product.sku,
      name: product.name,
      category: product.category,
      stock: product.currentStock,
      unitCost: product.unitCost,
      supplier: product.supplier || "",
      imageUrl: product.image || ""
    });
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setNewProduct({ sku: "", name: "", category: "Electronics", stock: "", unitCost: "", supplier: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setNewProduct({ sku: "", name: "", category: "Electronics", stock: "", unitCost: "", supplier: "", imageUrl: "" });
  };

  const handleDelete = async (sku: string) => {
    if (window.confirm(`⚠️ Bạn có chắc chắn muốn xóa sản phẩm mã ${sku} không? Hành động này không thể hoàn tác!`)) {
      try {
        const res = await fetch(`http://localhost:8000/api/inventory/products/${sku}`, {
          method: "DELETE",
          headers: getUserHeader()
        });
        
        if (!res.ok) {
          const errData = await res.json();
          const errorMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          throw new Error(errorMsg);
        }
        
        showNotify(`Đã xóa sản phẩm thành công!`, "success");
        setRefreshKey(old => old + 1); 
      } catch (err: any) {
        showNotify(err.message, "error");
      }
    }
  };

  const getStatusBadge = (status: Product["status"]) => {
    const styles = {
      critical: "bg-red-100 text-red-700 border-red-200",
      low: "bg-amber-100 text-amber-700 border-amber-200",
      healthy: "bg-green-100 text-green-700 border-green-200",
      overstock: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Biến kiểm tra xem có đang dùng bộ lọc nào không
  const isFiltering = searchTerm !== "" || categoryFilter !== "all" || statusFilter !== "all" || supplierFilter !== "all";

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Inventory Management</h1>
        <p className="text-sm text-slate-600">Track and manage your entire product catalog</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-semibold text-slate-900 mb-1">{products?.length || 0}</div>
          <div className="text-sm text-slate-600">Total Products</div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-semibold text-slate-900 mb-1">${(products?.reduce((sum, p) => sum + (p.totalValue || 0), 0) || 0).toLocaleString()}</div>
          <div className="text-sm text-slate-600">Total Value</div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-semibold text-slate-900 mb-1">{products?.filter(p => p.status === "critical").length || 0}</div>
          <div className="text-sm text-slate-600">Critical Items</div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-semibold text-slate-900 mb-1">{products?.filter(p => p.status === "low").length || 0}</div>
          <div className="text-sm text-slate-600">Low Stock Items</div>
        </div>
        <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
          <div className="text-2xl font-semibold text-slate-900 mb-1">{products?.filter(p => p.status === "overstock").length || 0}</div>
          <div className="text-sm text-slate-600">Overstock Items</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by SKU or Name..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]" 
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-slate-400" />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {filterOptions.categories?.map((c) => (<option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {filterOptions.statuses?.map((st) => (<option key={st} value={st}>{st === "all" ? "All Status" : st.charAt(0).toUpperCase() + st.slice(1)}</option>))}
            </select>
            <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="px-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500">
              {filterOptions.suppliers?.map((s) => (<option key={s} value={s}>{s === "all" ? "All Suppliers" : s}</option>))}
            </select>

            {/* --- NÚT XÓA BỘ LỌC TỰ ĐỘNG HIỆN --- */}
            {isFiltering && (
              <button 
                onClick={handleClearFilters}
                className="ml-2 flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                title="Xóa tất cả bộ lọc"
              >
                <X className="w-4 h-4" /> Xóa lọc
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button onClick={handleOpenAdd} className="px-4 py-2 bg-[#2563eb] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-900">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-4 py-4">Category</th>
                <th className="px-4 py-4 text-right">Stock</th>
                <th className="px-4 py-4 text-right">Unit Cost</th>
                <th className="px-4 py-4 text-right">Total Value</th>
                <th className="px-4 py-4 text-right">ROP</th>
                <th className="px-4 py-4 text-right">EOQ</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={9} className="py-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
              ) : products?.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-base font-medium text-slate-900">Không tìm thấy sản phẩm nào</p>
                    <p className="text-sm mt-1">Hãy thử thay đổi bộ lọc hoặc thêm sản phẩm mới.</p>
                  </td>
                </tr>
              ) : products?.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop"; }} />
                      <div>
                        <p className="font-medium text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{product.category}</td>
                  <td className="px-4 py-4 text-right font-semibold">{product.currentStock}</td>
                  <td className="px-4 py-4 text-right text-slate-600">${product.unitCost.toFixed(2)}</td>
                  <td className="px-4 py-4 text-right font-medium">${product.totalValue.toLocaleString()}</td>
                  
                  <td className="px-4 py-4 text-right font-medium text-slate-700">{product.reorderPoint}</td>
                  <td className="px-4 py-4 text-right font-medium text-slate-700">{product.eoq}</td>
                  
                  <td className="px-4 py-4 text-center">{getStatusBadge(product.status)}</td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.sku)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto border border-slate-100">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Package className={`w-5 h-5 ${isEditing ? 'text-amber-500' : 'text-blue-600'}`} /> 
              {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-4 items-center">
                <img 
                  src={newProduct.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop"} 
                  alt="Preview"
                  className={`w-16 h-16 rounded-md object-cover border border-slate-300 bg-white ${isUploading ? 'opacity-50' : ''}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&h=120&fit=crop"; }}
                />
                <div className="flex-1 overflow-hidden">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-blue-600" /> Cập nhật ảnh
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                    disabled={isUploading}
                    className="block w-full text-xs text-slate-500
                      file:mr-3 file:py-1.5 file:px-3
                      file:rounded-md file:border-0
                      file:text-xs file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã SKU <span className="text-red-500">*</span></label>
                <input required disabled={isEditing} type="text" placeholder="VD: PRO-001" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}/>
                {isEditing && <p className="text-xs text-slate-400 mt-1">Không thể thay đổi SKU của sản phẩm đã tạo.</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="Nhập tên sản phẩm..." value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-600 outline-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Danh mục</label>
                  <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tồn kho</label>
                  <input required type="number" min="0" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá nhập ($)</label>
                  <input required type="number" step="0.01" min="0" value={newProduct.unitCost} onChange={e => setNewProduct({...newProduct, unitCost: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhà cung cấp</label>
                  <input required type="text" placeholder="Tên công ty..." value={newProduct.supplier} onChange={e => setNewProduct({...newProduct, supplier: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"/>
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-slate-100">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Hủy</button>
                <button type="submit" className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isEditing ? "Lưu thay đổi" : "Lưu sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification.show && (
        <div className="fixed top-20 right-8 z-[60] animate-fade-in-down">
          <div className={`p-4 rounded-xl shadow-2xl flex items-start gap-3 w-80 relative overflow-hidden ${
            notification.type === 'success' 
              ? 'bg-[#10b981] border border-[#059669] text-white' 
              : 'bg-red-500 border border-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-base mb-1">
                {notification.type === 'success' ? 'Thành công!' : 'Thất bại!'}
              </h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <style>{`
            @keyframes fade-in-down {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.4s ease-out forwards; }
          `}</style>
        </div>
      )}

    </div>
  );
}