import React, { useEffect } from "react";
import { useUserStore } from "../../store/useAuthStore";
import { authClient } from "../../lib/authClient";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setUser, setLoading, setError } = useUserStore();

  const { data: session, isPending, error: sessionError } = authClient.useSession();

  useEffect(() => {
    setLoading(isPending);

    if (sessionError) {
      console.error("Session verification failed:", sessionError);
      setError("Failed to verify session");
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      } as any);
    } else if (!isPending) {
      setUser(null);
    }
  }, [session, isPending, sessionError, setUser, setLoading, setError]);

  return <>{children}</>;
};