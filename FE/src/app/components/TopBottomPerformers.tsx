import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string;
  revenue: number;
  units: number;
  velocity: number;
  trend: "up" | "down";
}

interface TopBottomPerformersProps {
  topData?: any[];
  bottomData?: any[];
}

export function TopBottomPerformers({ topData, bottomData }: TopBottomPerformersProps) {
  
  const topProducts: Product[] = Array.isArray(topData) && topData.length > 0 
    ? topData.map((item, index) => ({
        id: `top-${index}`,
        name: item.name,
        sku: item.sku,
        image: item.image,
        revenue: item.revenue,
        units: item.units,
        velocity: item.velocity,
        trend: item.trend as "up" | "down",
      }))
    : [];

  const bottomProducts: Product[] = Array.isArray(bottomData) && bottomData.length > 0 
    ? bottomData.map((item, index) => ({
        id: `bottom-${index}`,
        name: item.name,
        sku: item.sku,
        image: item.image,
        revenue: item.revenue,
        units: item.units,
        velocity: item.velocity,
        trend: item.trend as "up" | "down",
      }))
    : [];

  // COMPONENT HIỂN THỊ TỪNG DÒNG (ĐÃ BỎ CỘT ACTIONS)
  const ProductRow = ({ product, isTop }: { product: Product; isTop: boolean }) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
          />
          <div>
            <p className="text-sm font-medium text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-500">SKU: {product.sku}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-slate-900 font-medium">
        ${product.revenue.toLocaleString()}
      </td>
      <td className="py-3 px-4 text-sm text-slate-600">
        {product.units} units
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          {isTop ? (
            <ArrowUpRight className="w-4 h-4 text-[#10b981]" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-[#ef4444]" />
          )}
          <span className={`text-sm font-medium ${isTop ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {product.velocity}%
          </span>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Performers */}
      <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#10b981]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
            <p className="text-sm text-slate-600">Best-selling products this month</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Product</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Revenue</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Units</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Velocity</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length > 0 ? topProducts.map((product) => (
                <ProductRow key={product.id} product={product} isTop={true} />
              )) : (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 text-sm">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Performers */}
      <div className="bg-white rounded-lg p-6 border border-[#e2e8f0] shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-[#ef4444]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Slow Movers</h3>
            <p className="text-sm text-slate-600">Products with low turnover</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Product</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Revenue</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Units</th>
                <th className="text-left py-2 px-4 text-xs font-medium text-slate-600">Velocity</th>
              </tr>
            </thead>
            <tbody>
              {bottomProducts.length > 0 ? bottomProducts.map((product) => (
                <ProductRow key={product.id} product={product} isTop={false} />
              )) : (
                <tr><td colSpan={4} className="py-8 text-center text-slate-500 text-sm">Chưa có dữ liệu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}