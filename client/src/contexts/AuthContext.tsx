import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "staff" | "customer" | null;

type UserType = {
  username: string;
  phone: string;
  role: UserRole;
};

type LoginSession = {
  id?: string;
  username: string;
  role: UserRole;
  loginAt: string;
  logoutAt?: string | null;
  isOnline: boolean;
};

type AuthContextType = {
  user: UserType | null;
  isLoggedIn: boolean;
  users: UserType[];
  loginSessions: LoginSession[];
  onlineUsers: LoginSession[];

  login: (username: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;

  addUser: (user: UserType) => Promise<void>;
  removeUser: (username: string) => Promise<void>;

  refreshUsers: () => Promise<void>;
  refreshLoginSessions: () => Promise<void>;
};

const defaultAdmin: UserType = {
  username: "admin",
  phone: "0812345678",
  role: "admin",
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const toAppUser = (row: any): UserType => ({
  username: row.username,
  phone: row.phone,
  role: row.role || "customer",
});

const toDbUser = (user: UserType) => ({
  username: user.username,
  phone: user.phone,
  role: user.role || "customer",
  updated_at: new Date().toISOString(),
});

const toAppLoginSession = (row: any): LoginSession => ({
  id: row.id,
  username: row.username,
  role: row.role || "customer",
  loginAt: row.login_at,
  logoutAt: row.logout_at,
  isOnline: Boolean(row.is_online),
});

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<UserType[]>([defaultAdmin]);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);

  const currentSessionId =
    typeof window !== "undefined"
      ? localStorage.getItem("mdl_session_id")
      : null;

  const onlineUsers = loginSessions.filter((session) => session.isOnline);

  const refreshUsers = async () => {
    const { data, error } = await supabase
      .from("authorized_users")
      .select("*")
      .order("username", { ascending: true });

    if (error) {
      console.error("Load authorized users error:", error);

      const savedUsers = localStorage.getItem("mdl_users");
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        setUsers([defaultAdmin]);
      }

      return;
    }

    if (!data || data.length === 0) {
      await supabase
        .from("authorized_users")
        .upsert(toDbUser(defaultAdmin), { onConflict: "username" });

      setUsers([defaultAdmin]);
      return;
    }

    setUsers(data.map(toAppUser));
  };

  const refreshLoginSessions = async () => {
    const { data, error } = await supabase
      .from("login_sessions")
      .select("*")
      .order("login_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Load login sessions error:", error);
      return;
    }

    setLoginSessions((data || []).map(toAppLoginSession));
  };

  useEffect(() => {
    const boot = async () => {
      await refreshUsers();
      await refreshLoginSessions();

      const savedUser = localStorage.getItem("mdl_user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    };

    boot();

    const usersChannel = supabase
      .channel("authorized-users-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "authorized_users" },
        () => {
          refreshUsers();
        }
      )
      .subscribe();

    const sessionsChannel = supabase
      .channel("login-sessions-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "login_sessions" },
        () => {
          refreshLoginSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(sessionsChannel);
    };
  }, []);

  const login = async (username: string, phone: string) => {
    const cleanUsername = username.trim();
    const cleanPhone = phone.trim();

    let foundUser = users.find(
      (u) => u.username === cleanUsername && u.phone === cleanPhone
    );

    if (!foundUser) {
      const { data, error } = await supabase
        .from("authorized_users")
        .select("*")
        .eq("username", cleanUsername)
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (error) {
        console.error("Login lookup error:", error);
        return false;
      }

      if (data) {
        foundUser = toAppUser(data);
      }
    }

    if (!foundUser) return false;

    setUser(foundUser);
    localStorage.setItem("mdl_user", JSON.stringify(foundUser));

    const { data: sessionData, error: sessionError } = await supabase
      .from("login_sessions")
      .insert({
        username: foundUser.username,
        role: foundUser.role,
        login_at: new Date().toISOString(),
        logout_at: null,
        is_online: true,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Create login session error:", sessionError);
    } else if (sessionData?.id) {
      localStorage.setItem("mdl_session_id", sessionData.id);
    }

    await refreshLoginSessions();

    return true;
  };

  const logout = async () => {
    const sessionId = localStorage.getItem("mdl_session_id");

    if (sessionId) {
      const { error } = await supabase
        .from("login_sessions")
        .update({
          logout_at: new Date().toISOString(),
          is_online: false,
        })
        .eq("id", sessionId);

      if (error) {
        console.error("Logout session error:", error);
      }
    }

    setUser(null);
    localStorage.removeItem("mdl_user");
    localStorage.removeItem("mdl_session_id");

    await refreshLoginSessions();
  };

  const addUser = async (newUser: UserType) => {
    const cleanUser: UserType = {
      username: newUser.username.trim(),
      phone: newUser.phone.trim(),
      role: newUser.role || "customer",
    };

    if (!cleanUser.username || !cleanUser.phone) return;

    const { error } = await supabase
      .from("authorized_users")
      .upsert(toDbUser(cleanUser), { onConflict: "username" });

    if (error) {
      console.error("Add user error:", error);
      alert(error.message);
      return;
    }

    setUsers((prev) => {
      const exists = prev.some((u) => u.username === cleanUser.username);
      const updatedUsers = exists
        ? prev.map((u) => (u.username === cleanUser.username ? cleanUser : u))
        : [...prev, cleanUser];

      localStorage.setItem("mdl_users", JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const removeUser = async (username: string) => {
    if (username === "admin") {
      alert("ไม่สามารถลบ admin หลักได้");
      return;
    }

    const { error } = await supabase
      .from("authorized_users")
      .delete()
      .eq("username", username);

    if (error) {
      console.error("Remove user error:", error);
      alert(error.message);
      return;
    }

    setUsers((prev) => {
      const updatedUsers = prev.filter((u) => u.username !== username);
      localStorage.setItem("mdl_users", JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        users,
        loginSessions,
        onlineUsers,
        login,
        logout,
        addUser,
        removeUser,
        refreshUsers,
        refreshLoginSessions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
