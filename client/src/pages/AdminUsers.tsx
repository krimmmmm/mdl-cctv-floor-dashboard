import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "admin" | "staff" | "customer";

export default function AdminUsers() {
  const [, setLocation] = useLocation();

  const {
    users,
    addUser,
    removeUser,
    loginSessions = [],
    onlineUsers = [],
    refreshUsers = async () => {},
    refreshLoginSessions = async () => {},
  } = useAuth();

  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    refreshUsers();
    refreshLoginSessions();
  }, []);

  const loginToday = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    return loginSessions.filter((session: any) =>
      String(session.loginAt || "").slice(0, 10) === todayKey
    );
  }, [loginSessions]);

  const isUserOnline = (name: string) =>
    onlineUsers.some((session: any) => session.username === name);

  const getLastLogin = (name: string) => {
    const session = loginSessions.find((item: any) => item.username === name);
    if (!session?.loginAt) return "-";

    return new Date(session.loginAt).toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddUser = async () => {
    if (!username.trim() || !phone.trim()) {
      alert("กรุณากรอก Username และ เบอร์โทร");
      return;
    }

    setIsSaving(true);

    await addUser({
      username: username.trim(),
      phone: phone.trim(),
      role,
    });

    await refreshUsers();

    setUsername("");
    setPhone("");
    setRole("staff");
    setIsSaving(false);
  };

  const handleRemoveUser = async (name: string) => {
    const ok = window.confirm(`ยืนยันการลบสิทธิ์ของ ${name}?`);
    if (!ok) return;

    await removeUser(name);
    await refreshUsers();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800">
            User Permission Management
          </h1>

          <p className="text-slate-500 mt-2">
            สร้างโดย Tadchai Sittisomboon _ AWN (EPM)
          </p>
        </div>

        <button
          onClick={() => setLocation("/dashboard")}
          className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
        >
          กลับหน้าหลัก Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard title="Authorized Users" value={users.length} tone="blue" />
        <SummaryCard title="Online Now" value={onlineUsers.length} tone="green" />
        <SummaryCard title="Login Today" value={loginToday.length} tone="yellow" />
        <SummaryCard
          title="Customer Users"
          value={users.filter((u: any) => u.role === "customer").length}
          tone="purple"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-black mb-6">เพิ่มผู้ใช้งาน</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="border rounded-xl px-4 py-3"
          />

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="เบอร์โทร / Password"
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="border rounded-xl px-4 py-3"
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        <button
          onClick={handleAddUser}
          disabled={isSaving}
          className="mt-6 bg-green-600 hover:bg-green-500 disabled:bg-slate-300 text-white px-8 py-3 rounded-2xl font-bold"
        >
          {isSaving ? "กำลังบันทึก..." : "เพิ่มผู้ใช้งาน"}
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">รายชื่อผู้ใช้งาน</h2>

          <button
            onClick={() => {
              refreshUsers();
              refreshLoginSessions();
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[860px]">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left py-3 px-3">Username</th>
                <th className="text-left py-3 px-3">เบอร์โทร / Password</th>
                <th className="text-left py-3 px-3">Role</th>
                <th className="text-left py-3 px-3">Online</th>
                <th className="text-left py-3 px-3">Last Login</th>
                <th className="text-left py-3 px-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user: any) => {
                const online = isUserOnline(user.username);

                return (
                  <tr key={user.username} className="border-b hover:bg-slate-50">
                    <td className="py-4 px-3 font-bold text-slate-800">
                      {user.username}
                    </td>

                    <td className="py-4 px-3 text-slate-600">{user.phone}</td>

                    <td className="py-4 px-3">
                      <RolePill role={user.role} />
                    </td>

                    <td className="py-4 px-3">
                      {online ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                          Offline
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-sm text-slate-600">
                      {getLastLogin(user.username)}
                    </td>

                    <td className="py-4 px-3">
                      <button
                        onClick={() => handleRemoveUser(user.username)}
                        disabled={user.username === "admin"}
                        className="bg-red-500 hover:bg-red-400 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-semibold"
                      >
                        ลบสิทธิ์
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-black mb-6">Login Sessions ล่าสุด</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {loginSessions.slice(0, 12).map((session: any, index: number) => (
            <div
              key={session.id || index}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-black text-slate-900">
                    {session.username}
                  </div>
                  <div className="text-xs uppercase font-bold text-blue-600">
                    {session.role}
                  </div>
                </div>

                {session.isOnline ? (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-black text-green-700">
                    ONLINE
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-bold text-slate-500">
                    LOGOUT
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-500">
                Login:{" "}
                <b>
                  {session.loginAt
                    ? new Date(session.loginAt).toLocaleString("th-TH")
                    : "-"}
                </b>
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Logout:{" "}
                <b>
                  {session.logoutAt
                    ? new Date(session.logoutAt).toLocaleString("th-TH")
                    : "-"}
                </b>
              </div>
            </div>
          ))}

          {loginSessions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              ยังไม่มีประวัติการ Login
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SummaryCard = ({
  title,
  value,
  tone,
}: {
  title: string;
  value: any;
  tone: "blue" | "green" | "yellow" | "purple";
}) => {
  const toneClass: Record<string, string> = {
    blue: "from-blue-50 to-sky-50 text-blue-700",
    green: "from-green-50 to-emerald-50 text-green-700",
    yellow: "from-yellow-50 to-amber-50 text-yellow-700",
    purple: "from-purple-50 to-violet-50 text-purple-700",
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br ${toneClass[tone]} p-6 shadow-sm border border-white`}
    >
      <div className="text-xs font-bold text-slate-500">{title}</div>
      <div className="text-4xl font-black mt-2">{value}</div>
    </div>
  );
};

const RolePill = ({ role }: { role: string }) => {
  const cls =
    role === "admin"
      ? "bg-red-100 text-red-700"
      : role === "staff"
        ? "bg-blue-100 text-blue-700"
        : "bg-purple-100 text-purple-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${cls}`}>
      {role}
    </span>
  );
};
