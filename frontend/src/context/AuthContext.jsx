import { createContext, useContext, useEffect } from "react";
import useUserStore from "../store/user.store";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isLoading, fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
