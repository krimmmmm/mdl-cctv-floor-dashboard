import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type UserRole =
  | "admin"
  | "staff"
  | "customer"
  | null;

type UserType = {
  username: string;
  phone: string;
  role: UserRole;
};

type AuthContextType = {
  user: UserType | null;
  isLoggedIn: boolean;

  login: (
    username: string,
    phone: string
  ) => Promise<boolean>;

  logout: () => void;

  users: UserType[];

  addUser: (
    user: UserType
  ) => void;

  removeUser: (
    username: string
  ) => void;
};

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] =
    useState<UserType | null>(null);

  const [users, setUsers] =
    useState<UserType[]>([
      {
        username: "admin",
        phone: "0812345678",
        role: "admin",
      },
    ]);

  useEffect(() => {
    const savedUser =
      localStorage.getItem("mdl_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedUsers =
      localStorage.getItem("mdl_users");

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const login = async (
    username: string,
    phone: string
  ) => {
    const foundUser = users.find(
      (u) =>
        u.username === username &&
        u.phone === phone
    );

    if (!foundUser) {
      return false;
    }

    setUser(foundUser);

    localStorage.setItem(
      "mdl_user",
      JSON.stringify(foundUser)
    );

    return true;
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      "mdl_user"
    );
  };

  const addUser = (
    newUser: UserType
  ) => {
    const updatedUsers = [
      ...users,
      newUser,
    ];

    setUsers(updatedUsers);

    localStorage.setItem(
      "mdl_users",
      JSON.stringify(updatedUsers)
    );
  };

  const removeUser = (
    username: string
  ) => {
    const updatedUsers =
      users.filter(
        (u) =>
          u.username !== username
      );

    setUsers(updatedUsers);

    localStorage.setItem(
      "mdl_users",
      JSON.stringify(updatedUsers)
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        users,
        addUser,
        removeUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);
