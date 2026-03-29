import { useState } from "react";
import { 
  Settings as SettingsIcon, 
  Mail, 
  MessageSquare, 
  Send, 
  Bell, 
  FileText, 
  Package, 
  AlertCircle,
  TrendingDown,
  Clock,
  DollarSign,
  Truck,
  Save,
  RotateCcw,
  ChevronRight,
  Info
} from "lucide-react";

interface AutomationRule {
  id: string;
  enabled: boolean;
  trigger: {
    type: string;
    label: string;
    icon: React.ReactNode;
    condition: string;
  };
  action: {
    type: string;
    label: string;
    icon: React.ReactNode;
    description: string;
  };
  service: {
    name: string;
    icon: React.ReactNode;
    color: string;
  };
}

interface SystemParameter {
  id: string;
  category: string;
  label: string;
  value: string | number;
  unit: string;
  description: string;
  icon: React.ReactNode;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"automation" | "parameters">("automation");

  // Automation Rules State
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: "rule-1",
      enabled: true,
      trigger: {
        type: "stock-below-rop",
        label: "Stock drops below ROP",
        icon: <Package className="w-4 h-4" />,
        condition: "When current stock ≤ Reorder Point",
      },
      action: {
        type: "generate-po-notify",
        label: "Generate draft PO & notify team",
        icon: <FileText className="w-4 h-4" />,
        description: "Create purchase order draft and send email to purchasing team",
      },
      service: {
        name: "Gmail",
        icon: <Mail className="w-5 h-5" />,
        color: "bg-red-100 text-red-600",
      },
    },
    {
      id: "rule-2",
      enabled: true,
      trigger: {
        type: "stock-critical",
        label: "Stock reaches critical level",
        icon: <AlertCircle className="w-4 h-4" />,
        condition: "When current stock = 0 OR stock < 10% of ROP",
      },
      action: {
        type: "urgent-alert",
        label: "Send urgent alert to manager",
        icon: <Bell className="w-4 h-4" />,
        description: "Immediate notification via Telegram with product details",
      },
      service: {
        name: "Telegram",
        icon: <Send className="w-5 h-5" />,
        color: "bg-blue-100 text-blue-600",
      },
    },
    {
      id: "rule-3",
      enabled: false,
      trigger: {
        type: "slow-mover",
        label: "Product identified as slow mover",
        icon: <TrendingDown className="w-4 h-4" />,
        condition: "When velocity < 5% for 30+ days",
      },
      action: {
        type: "team-notification",
        label: "Notify sales team",
        icon: <MessageSquare className="w-4 h-4" />,
        description: "Send Slack message to #sales channel with discount suggestions",
      },
      service: {
        name: "Slack",
        icon: <MessageSquare className="w-5 h-5" />,
        color: "bg-purple-100 text-purple-600",
      },
    },
    {
      id: "rule-4",
      enabled: true,
      trigger: {
        type: "overstock",
        label: "Overstock detected",
        icon: <Package className="w-4 h-4" />,
        condition: "When stock > 200% of EOQ for 14+ days",
      },
      action: {
        type: "weekly-report",
        label: "Include in weekly optimization report",
        icon: <FileText className="w-4 h-4" />,
        description: "Add to automated weekly email report with reduction recommendations",
      },
      service: {
        name: "Gmail",
        icon: <Mail className="w-5 h-5" />,
        color: "bg-red-100 text-red-600",
      },
    },
    {
      id: "rule-5",
      enabled: false,
      trigger: {
        type: "demand-spike",
        label: "Demand spike detected",
        icon: <TrendingDown className="w-4 h-4" />,
        condition: "When daily sales > 150% of 7-day average",
      },
      action: {
        type: "instant-alert",
        label: "Send instant alert",
        icon: <Bell className="w-4 h-4" />,
        description: "Real-time notification to procurement team via Slack",
      },
      service: {
        name: "Slack",
        icon: <MessageSquare className="w-5 h-5" />,
        color: "bg-purple-100 text-purple-600",
      },
    },
  ]);

  // System Parameters State
  const [systemParameters, setSystemParameters] = useState<SystemParameter[]>([
    {
      id: "param-1",
      category: "Cost Parameters",
      label: "Annual Holding Cost Rate",
      value: 20,
      unit: "%",
      description: "Percentage of unit cost charged annually for holding inventory (warehousing, insurance, depreciation)",
      icon: <DollarSign className="w-5 h-5 text-[#10b981]" />,
    },
    {
      id: "param-2",
      category: "Cost Parameters",
      label: "Default Order Cost",
      value: 125,
      unit: "$ per order",
      description: "Fixed cost incurred per purchase order (admin, processing, shipping)",
      icon: <DollarSign className="w-5 h-5 text-[#10b981]" />,
    },
    {
      id: "param-3",
      category: "Supplier Lead Times",
      label: "TechSupply Co.",
      value: 7,
      unit: "days",
      description: "Average time from order placement to delivery",
      icon: <Truck className="w-5 h-5 text-[#2563eb]" />,
    },
    {
      id: "param-4",
      category: "Supplier Lead Times",
      label: "WearableTech Ltd.",
      value: 14,
      unit: "days",
      description: "Average time from order placement to delivery",
      icon: <Truck className="w-5 h-5 text-[#2563eb]" />,
    },
    {
      id: "param-5",
      category: "Supplier Lead Times",
      label: "CableWorld Inc.",
      value: 5,
      unit: "days",
      description: "Average time from order placement to delivery",
      icon: <Truck className="w-5 h-5 text-[#2563eb]" />,
    },
    {
      id: "param-6",
      category: "Supplier Lead Times",
      label: "OfficeGear Plus",
      value: 10,
      unit: "days",
      description: "Average time from order placement to delivery",
      icon: <Truck className="w-5 h-5 text-[#2563eb]" />,
    },
    {
      id: "param-7",
      category: "Safety Stock",
      label: "Service Level Target",
      value: 95,
      unit: "%",
      description: "Desired probability of not running out of stock during lead time",
      icon: <Package className="w-5 h-5 text-[#f59e0b]" />,
    },
    {
      id: "param-8",
      category: "Safety Stock",
      label: "Default Safety Stock Days",
      value: 7,
      unit: "days",
      description: "Additional buffer stock in days of average demand",
      icon: <Package className="w-5 h-5 text-[#f59e0b]" />,
    },
    {
      id: "param-9",
      category: "Forecasting",
      label: "Forecast Horizon",
      value: 90,
      unit: "days",
      description: "Number of days to forecast ahead for demand planning",
      icon: <Clock className="w-5 h-5 text-[#8b5cf6]" />,
    },
    {
      id: "param-10",
      category: "Forecasting",
      label: "Historical Data Window",
      value: 365,
      unit: "days",
      description: "Number of past days to use for forecasting models",
      icon: <Clock className="w-5 h-5 text-[#8b5cf6]" />,
    },
  ]);

  const toggleRule = (ruleId: string) => {
    setAutomationRules(rules =>
      rules.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const updateParameter = (paramId: string, newValue: string | number) => {
    setSystemParameters(params =>
      params.map(param =>
        param.id === paramId ? { ...param, value: newValue } : param
      )
    );
  };

  const groupedParameters = systemParameters.reduce((acc, param) => {
    if (!acc[param.category]) {
      acc[param.category] = [];
    }
    acc[param.category].push(param);
    return acc;
  }, {} as Record<string, SystemParameter[]>);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-1">Settings</h1>
        <p className="text-sm text-slate-600">
          Configure automation workflows and system parameters for SmartStock
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm">
        <div className="border-b border-slate-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("automation")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "automation"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              Automation Rules
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "parameters"
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              System Parameters
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Automation Rules Tab */}
          {activeTab === "automation" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Workflow Automation Rules</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Configure If-This-Then-That rules to automate inventory management tasks
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-[#10b981] rounded-lg text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {automationRules.filter(r => r.enabled).length} Active
                </div>
              </div>

              {automationRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`border-2 rounded-lg p-5 transition-all ${
                    rule.enabled
                      ? "border-[#2563eb] bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Toggle Switch */}
                    <div className="flex items-center pt-1">
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          rule.enabled ? "bg-[#2563eb]" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            rule.enabled ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Rule Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        {/* IF Section */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded font-semibold">
                              IF
                            </span>
                            <span className="text-sm font-medium text-slate-900">
                              {rule.trigger.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 ml-2">
                            {rule.trigger.icon}
                            <span>{rule.trigger.condition}</span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />

                        {/* THEN Section */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-1 bg-[#2563eb] text-white text-xs rounded font-semibold">
                              THEN
                            </span>
                            <span className="text-sm font-medium text-slate-900">
                              {rule.action.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 ml-2">
                            {rule.action.icon}
                            <span>{rule.action.description}</span>
                          </div>
                        </div>

                        {/* Service Integration */}
                        <div className="flex-shrink-0">
                          <div className={`${rule.service.color} p-3 rounded-lg flex flex-col items-center gap-1 min-w-[80px]`}>
                            {rule.service.icon}
                            <span className="text-xs font-medium">{rule.service.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                        <span className={`text-xs font-medium ${rule.enabled ? 'text-[#10b981]' : 'text-slate-400'}`}>
                          {rule.enabled ? '● Active and monitoring' : '○ Inactive'}
                        </span>
                        <button className="text-xs text-[#2563eb] hover:underline">
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-[#2563eb] hover:text-[#2563eb] transition-colors">
                + Add New Automation Rule
              </button>
            </div>
          )}

          {/* System Parameters Tab */}
          {activeTab === "parameters" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">System Configuration Parameters</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Set company-specific values for inventory calculations and forecasting
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                  </button>
                  <button className="px-4 py-2 bg-[#2563eb] text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              {Object.entries(groupedParameters).map(([category, params]) => (
                <div key={category} className="space-y-4">
                  <h4 className="text-md font-semibold text-slate-900 flex items-center gap-2">
                    {params[0].icon}
                    {category}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {params.map((param) => (
                      <div
                        key={param.id}
                        className="bg-white border border-slate-200 rounded-lg p-4 hover:border-[#2563eb] transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                              {param.label}
                              <button className="group relative">
                                <Info className="w-3.5 h-3.5 text-slate-400 hover:text-[#2563eb]" />
                                <span className="absolute hidden group-hover:block left-0 top-5 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                                  {param.description}
                                </span>
                              </button>
                            </label>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={param.value}
                            onChange={(e) => updateParameter(param.id, parseFloat(e.target.value) || 0)}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
                          />
                          <span className="text-sm text-slate-600 min-w-[80px]">{param.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Info Box */}
              <div className="bg-blue-50 border-l-4 border-[#2563eb] p-4 rounded-lg">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-[#2563eb] flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 mb-1">
                      How these parameters affect your inventory
                    </h5>
                    <p className="text-xs text-slate-600">
                      Changes to these parameters will automatically recalculate EOQ, ROP, and safety stock levels for all products.
                      Higher holding costs favor smaller order quantities, while longer lead times increase safety stock requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
