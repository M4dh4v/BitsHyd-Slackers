import useUserStore from "../store/user.store"; // ✅ Now it correctly imports the default export

const useAuth = () => {
  const { user, fetchUser, login, logout } = useUserStore();

  return { user, fetchUser, login, logout };
};

export default useAuth;
