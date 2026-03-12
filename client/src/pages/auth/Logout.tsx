import React, { useEffect, useRef } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { LOGOUT_MUTATION } from "../../graphql/mutation/userMutations";
import Loader from "../../components/layout/Loader";
import { posthog } from "../../components/providers/PostHogProvider";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const client = useApolloClient(); // Gives us access to the Apollo Cache
  const hasLoggedOut = useRef(false); // Prevents React StrictMode double-firing

  const [logout, { loading, error }] = useMutation(LOGOUT_MUTATION, {
    onCompleted: async () => {
      // 1. Wipe local storage
      localStorage.removeItem("user");
      // Note: If you have other keys like 'token' or 'theme', you can use localStorage.clear() instead.

      // 2. Nuke the Apollo Cache memory to prevent data leaks
      await client.clearStore();

      posthog.capture("user_logged_out");
      posthog.reset();

      // 3. Notify and redirect
      toast.success("Successfully logged out");
      navigate("/");
    },
    onError: async (err) => {
      console.error("Backend logout failed:", err.message);
      toast.error("Network issue, but local session cleared.");

      // FALLBACK: Even if the server request fails, force a local logout for security
      localStorage.removeItem("user");
      await client.clearStore();
      navigate("/");
    },
  });

  useEffect(() => {
    // Ensure the mutation only fires once, even if React mounts it twice in dev mode
    if (!hasLoggedOut.current) {
      hasLoggedOut.current = true;
      logout().catch(console.error);
    }
  }, [logout]);

  return (
    <div className="flex justify-center items-center min-h-screen font-mono bg-[#11131A]">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader />
          <p className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">
            Securely logging out...
          </p>
        </div>
      ) : error ? (
        <div className="text-red-400 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl shadow-lg">
          Error logging out: {error.message}
        </div>
      ) : null}
    </div>
  );
};

export default Logout;
