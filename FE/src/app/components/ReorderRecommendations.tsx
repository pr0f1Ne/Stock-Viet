import { Sparkles, Clock, DollarSign, Package, CheckCircle2, Plus } from "lucide-react";

interface ReorderRecommendation {
  id: string;
  product: string;
  sku: string;
  image: string;
  currentStock: number;
  recommendedQty: number;
  estimatedCost: number;
  reorderInDays: number;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  supplier: string;
}

// 1. Mở cửa nhận gói hàng từ DashboardHome
interface ReorderRecommendationsProps {
  reorderData?: any[];
}

export function ReorderRecommendations({ reorderData }: ReorderRecommendationsProps) {
  
  const images = [
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=80&h=80&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
    "https://images.unsplash.com/photo-1591290619762-d06885d2c7e9?w=80&h=80&fit=crop",
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=80&h=80&fit=crop"
  ];

  // 2. Bộ chuyển đổi: "Dịch" dữ liệu Python sang chuẩn UI
  const recommendations: ReorderRecommendation[] = reorderData && reorderData.length > 0
    ? reorderData.map((item, index) => {
        // Tính toán số ngày còn lại dựa vào tồn kho và tốc độ bán trung bình
        const avgDaily = item.avgDailySales || 1;
        const reorderInDays = Math.max(0, Math.floor(item.currentStock / avgDaily));
        
        // Phân loại độ tự tin (Confidence)
        let confidenceLevel: "high" | "medium" | "low" = "medium";
        if (item.confidence >= 90) confidenceLevel = "high";
        else if (item.confidence < 75) confidenceLevel = "low";

        return {
          id: item.id || String(index),
          product: item.product,
          sku: item.sku,
          image: images[index % images.length],
          currentStock: item.currentStock,
          recommendedQty: item.suggestedQty,
          // Giả lập giá nhập (Cost) trung bình khoảng $25/sp để lên UI cho đẹp
          estimatedCost: item.suggestedQty * 25, 
          reorderInDays: reorderInDays,
          // AI tự động sinh ra lý do khuyên nhập hàng
          reasoning: `Based on avg sales (${avgDaily.toFixed(1)} units/day), current stock will deplete in ${reorderInDays} days`,
          confidence: confidenceLevel,
          supplier: "TechSupply Co." // Mock nhà cung cấp
        };
      })
    : [];

  const getConfidenceBadge = (confidence: ReorderRecommendation["confidence"]) => {
    switch (confidence) {
      case "high":
        return (
          <span className="px-2 py-1 bg-green-100 text-[#10b981] text-xs rounded-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            High Confidence
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 bg-amber-100 text-[#f59e0b] text-xs rounded-md">
            Medium Confidence
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
            Low Confidence
          </span>
        );
    }
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 5) return "text-[#ef4444]";
    if (days <= 10) return "text-[#f59e0b]";
    return "text-[#10b981]";
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Smart Reorder Recommendations</h3>
            <p className="text-sm text-slate-600">AI-powered purchase order suggestions</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Bulk PO
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.length > 0 ? recommendations.map((rec) => (
          <div
            key={rec.id}
            className="border border-slate-200 rounded-lg p-4 hover:border-[#2563eb] hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <img
                src={rec.image}
                alt={rec.product}
                className="w-20 h-20 rounded-lg object-cover border border-slate-200"
              />

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{rec.product}</h4>
                    <p className="text-xs text-slate-500">SKU: {rec.sku} • Supplier: {rec.supplier}</p>
                  </div>
                  {getConfidenceBadge(rec.confidence)}
                </div>

                {/* AI Reasoning */}
                <div className="bg-purple-50 border-l-4 border-[#8b5cf6] p-3 rounded-lg mb-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#8b5cf6] flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700">{rec.reasoning}</p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Current Stock
                    </p>
                    <p className="text-sm font-semibold text-slate-900">{rec.currentStock} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Recommended Qty
                    </p>
                    <p className="text-sm font-semibold text-[#2563eb]">{rec.recommendedQty} units</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Est. Cost
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      ${rec.estimatedCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Reorder In
                    </p>
                    <p className={`text-sm font-semibold ${getUrgencyColor(rec.reorderInDays)}`}>
                      {rec.reorderInDays} days
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                    Add to Draft PO
                  </button>
                  <button className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Send to Supplier
                  </button>
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
                    Adjust
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-8 text-center text-slate-500 text-sm border border-slate-200 rounded-lg">
            Đang phân tích dữ liệu kho hoặc chưa có đề xuất nhập hàng mới.
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-slate-600">Total Recommendations</p>
            <p className="text-lg font-semibold text-slate-900">{recommendations.length} items</p>
          </div>
          <div>
            <p className="text-xs text-slate-600">Est. Total Investment</p>
            <p className="text-lg font-semibold text-slate-900">
              ${recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm">
          View All Recommendations
        </button>
      </div>
    </div>
  );
}