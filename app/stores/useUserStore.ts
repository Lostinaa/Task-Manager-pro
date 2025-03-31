import { create } from "zustand";
import { signIn, signOut } from "next-auth/react";

type User = {
  id: string;
  email: string;
};

interface UserStoreInterface {
  user: User | null;
  setUser: (newUser: User | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  handleLogout: () => Promise<void>;
  validateUser: () => Promise<boolean>;
  loginFunction: (data: {
    email: string;
    password: string;
  }) => Promise<{ error?: string; isLoggedIn: boolean }>;
  signUpFunction: (data: {
    email: string;
    password: string;
  }) => Promise<{ error?: string }>;
}

export const useUserStore = create<UserStoreInterface>((set) => {
  return {
    user: null,
    isLoading: false,
    setUser: (newUser: User | null) => {
      set({ user: newUser });
    },

    setIsLoading: (isLoading: boolean) => {
      set({ isLoading: isLoading });
    },

    validateUser: async () => {
      try {
        set({ isLoading: true });
        const response = await fetch("/api/validate-user");
        const data = await response.json();

        if (data.user) {
          set({ user: data.user });
          return true;
        } else {
          set({ user: null });
          return false;
        }
      } catch (error) {
        console.error("Validation error:", error);
        set({ user: null });
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    handleLogout: async () => {
      try {
        set({ isLoading: true });
        await signOut({ redirect: false });
        set({ user: null });
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    loginFunction: async (data: { email: string; password: string }) => {
      set({ isLoading: true });

      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          return { error: result.error, isLoggedIn: false };
        }

        return { isLoggedIn: true };
      } catch (error) {
        console.error("Sign in error:", error);
        return { error: "An unexpected error occurred", isLoggedIn: false };
      } finally {
        set({ isLoading: false });
      }
    },

    signUpFunction: async (data: { email: string; password: string }) => {
      set({ isLoading: true });

      try {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email, password: data.password }),
        });

        const result = await response.json();

        if (result.error) {
          return { error: result.error };
        }

        return {};
      } catch (error) {
        console.error("Sign up error:", error);
        return { error: "An unexpected error occurred" };
      } finally {
        set({ isLoading: false });
      }
    },
  };
});
