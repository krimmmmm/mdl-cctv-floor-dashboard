import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminUsers() {
  const [, setLocation] = useLocation();

  const {
    users,
    addUser,
    removeUser,
  } = useAuth();

  const [username, setUsername] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [role, setRole] =
    useState<
      "admin" | "staff" | "customer"
    >("staff");

  const handleAddUser = () => {
    if (!username || !phone) {
      return;
    }

    addUser({
      username,
      phone,
      role,
    });

    setUsername("");
    setPhone("");
    setRole("staff");
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* Header */}
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
          onClick={() =>
            setLocation("/dashboard")
          }
          className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
        >
          กลับหน้าหลัก Dashboard
        </button>
      </div>

      {/* Add User */}
      <div className="bg-white rounded-3xl shadow-lg p-8">

        <h2 className="text-2xl font-black mb-6">
          เพิ่มผู้ใช้งาน
        </h2>

        <div className="grid grid-cols-3 gap-4">

          <input
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            placeholder="Username"
            className="border rounded-xl px-4 py-3"
          />

          <input
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
            placeholder="เบอร์โทร"
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(
                e.target
                  .value as any
              )
            }
            className="border rounded-xl px-4 py-3"
          >
            <option value="admin">
              Admin
            </option>

            <option value="staff">
              Staff
            </option>

            <option value="customer">
              Customer
            </option>
          </select>
        </div>

        <button
          onClick={handleAddUser}
          className="mt-6 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-2xl font-bold"
        >
          เพิ่มผู้ใช้งาน
        </button>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">

        <h2 className="text-2xl font-black mb-6">
          รายชื่อผู้ใช้งาน
        </h2>

        <table className="w-full">

          <thead>
            <tr className="border-b">

              <th className="text-left py-3">
                Username
              </th>

              <th className="text-left py-3">
                เบอร์โทร
              </th>

              <th className="text-left py-3">
                Role
              </th>

              <th className="text-left py-3">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {users.map((user) => (
              <tr
                key={user.username}
                className="border-b"
              >

                <td className="py-4">
                  {user.username}
                </td>

                <td className="py-4">
                  {user.phone}
                </td>

                <td className="py-4 capitalize">
                  {user.role}
                </td>

                <td className="py-4">

                  <button
                    onClick={() =>
                      removeUser(
                        user.username
                      )
                    }
                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    ลบสิทธิ์
                  </button>

                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>
    </div>
  );
}
