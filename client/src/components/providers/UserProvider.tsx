import React, { useEffect } from "react";
import { useUserStore } from "../../store/useAuthStore";
import { useGetUserProfileQuery } from "../../graphql/generated/graphql";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { setUser, setLoading, setError } = useUserStore();

  // Grab the ID from localStorage
  const storedUser = localStorage.getItem("user");
  const currentUserId = storedUser ? JSON.parse(storedUser).id : null;

  // Fetch the data
  const { data, loading, error } = useGetUserProfileQuery({
    variables: { id: currentUserId || "" },
    skip: !currentUserId,
    fetchPolicy: "cache-first", // Uses cache if available, saving network requests
  });

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    setLoading(loading);

    if (error) {
      console.error("Failed to fetch global user:", error);
      setError(error.message);
    }

    if (data?.getUserProfile) {
      setUser(data.getUserProfile as any);
    }
  }, [data, loading, error, currentUserId, setUser, setLoading, setError]);

  return <>{children}</>;
};
