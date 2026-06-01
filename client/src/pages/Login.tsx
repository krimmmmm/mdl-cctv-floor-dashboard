import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  User,
  Users,
  TrendingUp,
  BriefcaseBusiness,
} from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setError("");

    const success = await login(username, phone);

    if (!success) {
      setError("Username หรือ เบอร์โทรไม่ถูกต้อง");
      return;
    }

    setLocation("/dashboard");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#031235] text-white">
      <div className="relative min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_70%,rgba(0,102,255,0.35),transparent_28%),linear-gradient(115deg,#020b24_0%,#062764_48%,#0a1c47_70%,#071736_100%)]" />
        <div className="absolute inset-0 opacity-45">
          <div className="absolute left-0 bottom-0 h-[72%] w-[58%] bg-[radial-gradient(circle_at_10%_80%,rgba(0,183,255,0.45),transparent_18%),radial-gradient(circle_at_30%_62%,rgba(23,91,255,0.28),transparent_20%)]" />
          <div className="absolute left-0 bottom-0 h-[62%] w-[55%] bg-[linear-gradient(35deg,rgba(42,151,255,0.22)_1px,transparent_1px),linear-gradient(120deg,rgba(42,151,255,0.18)_1px,transparent_1px)] bg-[length:56px_56px]" />
        </div>

        {/* Creator Head */}
        <div className="relative z-20 px-4 pt-3">
          <div className="flex items-center gap-3 rounded-xl border border-yellow-500/80 bg-[#031331]/75 px-4 py-3 shadow-lg backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <User className="h-6 w-6 text-white" />
            </div>

            <div className="text-xl font-black tracking-tight">
              <span className="text-white">สร้างโดย </span>
              <span className="text-yellow-400">
                Tadchai Sittisomboon _ AWN (EPM)
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid min-h-[calc(100vh-68px)] grid-cols-1 gap-8 px-10 pb-8 pt-5 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left Branding */}
          <section className="relative flex min-h-[720px] flex-col justify-center overflow-hidden rounded-[28px] px-6 lg:px-10">
            <div className="absolute inset-y-0 right-0 hidden w-[58%] skew-x-[-10deg] bg-gradient-to-br from-white/12 to-transparent lg:block" />

            <div className="relative z-10">
              <h1 className="select-none text-[76px] font-black leading-[0.9] tracking-[0.13em] text-white drop-shadow-2xl md:text-[108px]">
                MINOR
                <br />
                DA<span className="text-yellow-400">i</span>RY
                <span className="text-yellow-400">+</span>
              </h1>

              <div className="mt-6 text-2xl font-black tracking-wide text-white md:text-3xl">
                EXECUTIVE PM DASHBOARD
              </div>

              <div className="mt-8 flex flex-wrap gap-8 text-white">
                <FeatureItem
                  icon={<ShieldCheck className="h-8 w-8" />}
                  title="Smart"
                  subtitle="Monitoring"
                />
                <FeatureItem
                  icon={<Lock className="h-8 w-8" />}
                  title="Reliable"
                  subtitle="Security"
                />
                <FeatureItem
                  icon={<TrendingUp className="h-8 w-8" />}
                  title="Better"
                  subtitle="Future"
                />
              </div>

              <div className="mt-10 flex items-center gap-5">
                <div className="relative h-20 w-36">
                  <div className="absolute left-0 top-2 h-10 w-32 rounded-[100%] bg-lime-400 rotate-[-12deg]" />
                  <div className="absolute left-2 top-7 h-5 w-32 rounded-[100%] bg-lime-300 rotate-[-6deg]" />
                  <div className="absolute left-3 top-9 h-5 w-28 rounded-[100%] bg-[#06164a] rotate-[-7deg]" />
                </div>
                <div className="text-5xl font-black tracking-wide text-white">
                  AWN
                </div>
              </div>
            </div>

            {/* Building visual */}
            <div className="absolute bottom-0 right-0 z-0 h-[78%] w-[66%] opacity-70">
              <div className="absolute bottom-0 right-0 h-full w-full skew-x-[-10deg] rounded-tl-[60px] border-l border-white/20 bg-gradient-to-br from-blue-300/20 via-slate-700/30 to-black/60 shadow-2xl">
                <div className="grid h-full grid-cols-6 gap-2 p-8 pt-16">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-sm border border-blue-100/20 bg-blue-100/10"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Generic camera illustrations, no brand */}
            <div className="absolute bottom-8 left-10 z-20 hidden lg:block">
              <div className="relative h-[310px] w-[560px]">
                <div className="absolute left-24 top-42 h-24 w-72 rounded-[34px] border border-slate-200 bg-gradient-to-b from-white to-slate-200 shadow-2xl" />
                <div className="absolute left-9 top-39 h-28 w-28 rounded-[28px] border border-slate-300 bg-gradient-to-b from-white to-slate-200 shadow-xl">
                  <div className="absolute left-5 top-5 h-20 w-20 rounded-[20px] bg-slate-950 shadow-inner">
                    <div className="absolute left-6 top-6 h-8 w-8 rounded-full border-4 border-slate-600 bg-black" />
                  </div>
                </div>
                <div className="absolute left-330 top-30 h-44 w-44 rounded-full border border-slate-200 bg-gradient-to-br from-white to-slate-200 shadow-2xl" />
                <div className="absolute left-270 top-76 h-10 w-90 rounded-full bg-gradient-to-b from-white to-slate-200 shadow-xl" />

                <div className="absolute left-238 top-150 h-38 w-200 rounded-t-[70px] border border-slate-300 bg-gradient-to-b from-white to-slate-200 shadow-2xl" />
                <div className="absolute left-230 top-187 h-135 w-220 rounded-b-[75px] border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-300 shadow-2xl" />
                <div className="absolute left-286 top-205 h-90 w-90 rounded-full bg-slate-950 shadow-inner">
                  <div className="absolute left-24 top-24 h-42 w-42 rounded-full border-4 border-slate-600 bg-black" />
                  {Array.from({ length: 18 }).map((_, index) => {
                    const angle = (index / 18) * Math.PI * 2;
                    const x = 45 + Math.cos(angle) * 34;
                    const y = 45 + Math.sin(angle) * 34;
                    return (
                      <span
                        key={index}
                        className="absolute h-2 w-2 rounded-full bg-slate-200"
                        style={{ left: x, top: y }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Login Card */}
          <section className="flex items-center justify-center">
            <div className="w-full max-w-[540px] rounded-[28px] bg-white px-10 py-10 text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-blue-950 shadow-xl">
                  <ShieldCheck className="h-14 w-14 text-yellow-400" />
                </div>
              </div>

              <h2 className="mt-7 text-center text-4xl font-black text-blue-950">
                Welcome Back
              </h2>

              <p className="mt-2 text-center text-lg text-slate-500">
                Please sign in to continue
              </p>

              <div className="mt-8">
                <label className="font-black text-blue-950">Username</label>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                  <User className="h-6 w-6 text-blue-900/70" />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-base outline-none"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="font-black text-blue-950">
                  Password (เบอร์โทรศัพท์)
                </label>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500">
                  <Lock className="h-6 w-6 text-blue-900/70" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-base outline-none"
                    placeholder="Enter your phone number"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-blue-900/70 hover:text-blue-900"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <label className="flex items-center gap-3 text-sm font-semibold text-blue-950">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300"
                  />
                  Remember me
                </label>

                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                className="mt-6 w-full rounded-xl bg-blue-950 py-4 text-lg font-black text-white shadow-lg transition hover:bg-blue-800 active:scale-[0.99]"
              >
                Sign In
              </button>

              <div className="my-8 h-px bg-slate-200" />

              <div>
                <p className="text-lg font-black text-blue-950">
                  สำหรับผู้ดูแลระบบ (Admin)
                </p>

                <button
                  type="button"
                  onClick={async () => {
  const success = await login(username, phone);

  if (!success) {
    setError("กรุณา Login ด้วยสิทธิ์ Admin ก่อนเข้าหน้าจัดการผู้ใช้งาน");
    return;
  }

  setLocation("/admin/users");
}}
                  className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 px-5 py-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="flex items-center gap-4">
                    <Users className="h-10 w-10 text-blue-950" />
                    <div>
                      <div className="font-black text-blue-950">
                        จัดการผู้ใช้งานและสิทธิ์
                      </div>
                      <div className="text-sm text-slate-500">
                        ไปที่หน้ากำหนดสิทธิ์การเข้าใช้งาน
                      </div>
                    </div>
                  </div>

                  <div className="text-3xl font-light text-blue-900">›</div>
                </button>
              </div>

              <p className="mt-8 text-center text-base text-slate-500">
                © 2026 Tadchais <span className="mx-2">|</span> All rights reserved
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const FeatureItem = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="text-white">{icon}</div>
    <div className="text-lg font-semibold leading-tight">
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  </div>
);
