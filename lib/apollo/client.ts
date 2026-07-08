import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { Observable } from "@apollo/client/utilities";
import {
  clearAuthSession,
  getStoredAccessToken,
  isAccessTokenExpired,
  refreshAccessToken,
} from "@/lib/auth/session";

let apolloClient: ApolloClient | null = null;

function getGraphqlUri() {
  return process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql";
}

async function resolveAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  let token = getStoredAccessToken();
  if (!token) return null;

  if (isAccessTokenExpired(token)) {
    token = await refreshAccessToken();
  }

  return token;
}

export function createApolloClient() {
  const httpLink = createHttpLink({ uri: getGraphqlUri() });

  const authLink = setContext(async (_, { headers }) => {
    const token = await resolveAuthToken();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  const errorLink = onError(({ graphQLErrors, operation, forward }) => {
    const unauthorized = graphQLErrors?.some(
      (entry) => entry.extensions?.code === "UNAUTHORIZED"
    );

    if (!unauthorized || typeof window === "undefined") return;

    return new Observable((observer) => {
      refreshAccessToken()
        .then((token) => {
          if (!token) {
            clearAuthSession();
            if (window.location.pathname.startsWith("/admin")) {
              window.location.href = "/admin/login";
            }
            observer.error(new Error("Not authenticated"));
            return;
          }

          operation.setContext(({ headers = {} }) => ({
            headers: {
              ...headers,
              authorization: `Bearer ${token}`,
            },
          }));

          const subscriber = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer),
          });

          return () => subscriber.unsubscribe();
        })
        .catch((error) => observer.error(error));
    });
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            users: {
              keyArgs: ["filter", "sort"],
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
    },
  });
}

export function getApolloClient() {
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
}
