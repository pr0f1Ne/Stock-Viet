import { Package, TrendingUp, BarChart3, Zap, CheckCircle2, X, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = "233853391733-q9tj0draq8mqo0paemdfnt8apnu11nej.apps.googleusercontent.com";

export function LoginPage() {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userName, setUserName] = useState("");

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      if (!res.ok) {
        throw new Error("Backend từ chối");
      }
      
      const data = await res.json();
      
      // 1. Lưu thông tin người dùng
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("isAuthenticated", "true");
      
      // 2. Lấy tên người dùng để hiển thị vào Popup
      setUserName(data.user.name);

      // 3. Hiển thị Popup Modal giữa màn hình (Không dùng Alert/Console log nữa)
      setShowSuccessModal(true);
      
      // 4. Tự động chuyển vào Dashboard sau 2.5 giây
      setTimeout(() => {
        window.location.href = "/"; 
      }, 2500);
      
    } catch (error) {
      alert("Đăng nhập thất bại. Vui lòng thử lại!");
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-[#2563eb] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-[#10b981] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[#8b5cf6] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="text-white space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#2563eb] to-[#1e40af] flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">SmartStock</h1>
                  <p className="text-slate-400 text-sm">Inventory Optimizer</p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl font-semibold leading-tight">
                  Intelligent Inventory Management for Modern E-Commerce
                </h2>
                <p className="text-lg text-slate-300">
                  Optimize your inventory, reduce costs, and boost profitability
                  with AI-powered insights and automation.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                    <TrendingUp className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Forecasting</h3>
                    <p className="text-sm text-slate-400">AI-powered demand prediction to prevent stockouts</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/20">
                    <BarChart3 className="w-6 h-6 text-[#10b981]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real-Time Analytics</h3>
                    <p className="text-sm text-slate-400">Comprehensive insights into inventory performance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                  <p className="text-slate-300">Sign in to access your dashboard</p>
                </div>

                <div className="flex justify-center py-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => { alert("Đăng nhập thất bại!"); }}
                    useOneTap
                    shape="rectangular"
                    theme="filled_black"
                    text="continue_with"
                    size="large"
                  />
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-center text-sm text-slate-400">
                    By continuing, you agree to our{" "}
                    <a href="#" className="text-[#2563eb] hover:text-[#1e40af] underline">Terms of Service</a> and{" "}
                    <a href="#" className="text-[#2563eb] hover:text-[#1e40af] underline">Privacy Policy</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- POPUP MODAL CHUẨN FIGMA --- */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in-down">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => window.location.href = "/"}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" /> Đăng nhập thành công!
              </h2>
              
              <div className="py-4 text-slate-600">
                <p>Xin chào <strong className="text-slate-900">{userName}</strong>, chào mừng bạn đã quay trở lại SmartStock.</p>
                
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Hệ thống đang tự động tải dữ liệu kho của bạn...
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Đi tới Dashboard ngay
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes blob {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes fade-in-down {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
          .animate-fade-in-down { animation: fade-in-down 0.4s ease-out; }
        `}</style>
      </div>
    </GoogleOAuthProvider>
  );
}