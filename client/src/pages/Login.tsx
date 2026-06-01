import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();

  const { login } = useAuth();

  const [username, setUsername] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [error, setError] =
    useState("");

  const handleLogin = async () => {
    const success =
      await login(username, phone);

    if (!success) {
      setError(
        "Username หรือ เบอร์โทรไม่ถูกต้อง"
      );

      return;
    }

    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#06164a] flex flex-col">

      {/* Header */}
      <div className="px-6 py-3 border-b border-yellow-500">
        <p className="text-yellow-400 font-semibold text-lg">
          สร้างโดย Tadchai Sittisomboon _ AWN (EPM)
        </p>
      </div>

      <div className="flex flex-1">

        {/* Left */}
        <div className="w-1/2 flex flex-col justify-center px-16 text-white">

          <h1 className="text-8xl font-black leading-none">
            MINOR
            <br />
            DAIRY+
          </h1>

          <p className="mt-6 text-3xl font-bold">
            EXECUTIVE PM DASHBOARD
          </p>

          <div className="mt-10 space-y-3 text-xl text-slate-200">
            <p>
              • Smart Monitoring
            </p>

            <p>
              • Reliable Security
            </p>

            <p>
              • Better Future
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="w-1/2 flex items-center justify-center">

          <div className="bg-white rounded-3xl shadow-2xl p-10 w-[500px]">

            <h2 className="text-5xl font-black text-center text-slate-800">
              Welcome Back
            </h2>

            <p className="text-center text-slate-500 mt-3">
              Please sign in to continue
            </p>

            <div className="mt-10">

              <label className="font-semibold">
                Username
              </label>

              <input
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
                placeholder="Enter username"
              />
            </div>

            <div className="mt-6">

              <label className="font-semibold">
                Password (เบอร์โทรศัพท์)
              </label>

              <input
                type="password"
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl px-4 py-3 mt-2"
                placeholder="Enter phone number"
              />
            </div>

            {error && (
              <div className="mt-4 text-red-500 font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full bg-blue-900 hover:bg-blue-800 transition text-white rounded-xl py-4 mt-8 font-bold text-xl"
            >
              Sign In
            </button>

            <div className="mt-10 border-t pt-6">

              <p className="font-semibold text-slate-700">
                สำหรับผู้ดูแลระบบ
              </p>

              <button
                onClick={() =>
                  setLocation(
                    "/admin/users"
                  )
                }
                className="w-full border rounded-xl py-4 mt-4 font-bold hover:bg-slate-100"
              >
                จัดการผู้ใช้งานและสิทธิ์
              </button>
            </div>

            <p className="text-center text-slate-500 mt-8">
              © 2026 Tadchais | All rights reserved
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
