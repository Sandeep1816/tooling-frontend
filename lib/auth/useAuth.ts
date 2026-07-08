"use client";

import { useQuery } from "@/lib/apollo/hooks";
import { ME_QUERY } from "@/lib/graphql/operations";
import { getSessionUser, type SessionUser } from "./session";

export function useAuth() {
  const sessionUser = typeof window !== "undefined" ? getSessionUser() : null;

  const { data, loading, refetch } = useQuery(ME_QUERY, {
    skip: !sessionUser,
    fetchPolicy: "network-only",
  });

  const user: SessionUser | null = data?.me
    ? {
        ...data.me,
        role: String(data.me.role).toLowerCase(),
      }
    : sessionUser;

  return {
    user,
    loading: Boolean(sessionUser) && loading,
    refetch,
    isAuthenticated: Boolean(user),
  };
}
