export interface SessionUser {
  id: string;
  email: string;
  role: string;
  username: string;
  fullName?: string | null;
  isOnboarded: boolean;
  companyId: string | null;
  avatarUrl?: string | null;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    username: string;
    fullName?: string | null;
    isOnboarded: boolean;
    companyId: string | null;
    avatarUrl?: string | null;
  };
}

export function toSessionUser(user: AuthPayload["user"]): SessionUser {
  return {
    ...user,
    role: String(user.role).toLowerCase(),
  };
}

export function saveAuthSession(payload: AuthPayload) {
  const user = toSessionUser(payload.user);
  localStorage.setItem("accessToken", payload.accessToken);
  localStorage.setItem("refreshToken", payload.refreshToken);
  localStorage.setItem("token", payload.accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("userChanged"));
}

export function clearAuthSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("userChanged"));
}

export function getSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token") || localStorage.getItem("accessToken");
}

export function isAccessTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as { exp?: number };
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000 - 30_000;
  } catch {
    return true;
  }
}

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) return null;

    try {
      const uri =
        process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";
      const res = await fetch(uri, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `
            mutation Refresh($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
                refreshToken
                user {
                  id
                  email
                  role
                  username
                  fullName
                  isOnboarded
                  companyId
                  avatarUrl
                }
              }
            }
          `,
          variables: { input: { refreshToken } },
        }),
      });

      const json = (await res.json()) as {
        data?: { refreshToken?: AuthPayload };
      };
      const payload = json.data?.refreshToken;
      if (!payload?.accessToken) return null;

      saveAuthSession(payload);
      return payload.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export function isUnauthorizedError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  if ("graphQLErrors" in error) {
    const graphQLErrors = (error as { graphQLErrors?: { message?: string; extensions?: { code?: string } }[] })
      .graphQLErrors;
    return (
      graphQLErrors?.some(
        (entry) =>
          entry.extensions?.code === "UNAUTHORIZED" ||
          entry.message?.toLowerCase().includes("not authenticated")
      ) ?? false
    );
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes("not authenticated");
  }

  return false;
}

export function getGraphQLErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "graphQLErrors" in error &&
    Array.isArray((error as { graphQLErrors: unknown[] }).graphQLErrors)
  ) {
    const first = (error as { graphQLErrors: { message?: string }[] })
      .graphQLErrors[0];
    if (first?.message) return first.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong";
}

export function toGraphQLRole(role: "candidate" | "recruiter"): string {
  return role === "recruiter" ? "RECRUITER" : "CANDIDATE";
}
