import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectToken, selectIsAuthed, selectIsAuthHydrated, hydrateFromStorage, logout } from "@/store/authSlice";
import { useEffect } from "react";

export const useAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const isAuthed = useSelector(selectIsAuthed);
  const isHydrated = useSelector(selectIsAuthHydrated);

  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateFromStorage());
    }
  }, [dispatch, isHydrated]);

  const handleLogout = () => {
    dispatch(logout());
    if (typeof window !== "undefined") {
      const event = new CustomEvent('showToast', { 
        detail: { message: 'Logged out successfully', type: 'success' } 
      });
      window.dispatchEvent(event);
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  };

  return {
    user,
    token,
    isAuthed,
    isHydrated,
    logout: handleLogout,
  };
};