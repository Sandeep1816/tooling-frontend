const DEFAULT_GRAPHQL_URL = "http://localhost:4000/graphql";

export function getGraphqlUrl() {
  return process.env.NEXT_PUBLIC_GRAPHQL_URL ?? DEFAULT_GRAPHQL_URL;
}

export function getGraphqlOrigin() {
  return getGraphqlUrl().replace(/\/graphql\/?$/, "");
}

export function getUploadUrl() {
  return `${getGraphqlOrigin()}/upload`;
}

export function getUploadResumeUrl() {
  return `${getGraphqlOrigin()}/upload/resume`;
}

export function getCalendarEventUrl(slug: string) {
  return `${getGraphqlOrigin()}/calendar/event/${slug}.ics`;
}

export function getBannerClickUrl(id: string) {
  return `${getGraphqlOrigin()}/banners/${id}/click`;
}

export function getBannerImpressionUrl(id: string) {
  return `${getGraphqlOrigin()}/banners/${id}/impression`;
}

export function getAdminBulkUploadUrl() {
  return `${getGraphqlOrigin()}/admin/bulk-full-setup`;
}

export function getAdminBulkTemplateUrl() {
  return `${getGraphqlOrigin()}/admin/bulk-full-setup/template`;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { token?: string; cache?: RequestCache }
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let res: Response;
  try {
    res = await fetch(getGraphqlUrl(), {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: options?.cache ?? "no-store",
    });
  } catch (err) {
    const url = getGraphqlUrl();
    const message =
      err instanceof TypeError
        ? `Cannot reach GraphQL at ${url}. Start newsprk-graphql (npm run dev on port 4000).`
        : err instanceof Error
          ? err.message
          : "Network request failed";
    throw new Error(message);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data) {
    throw new Error("No data returned from GraphQL");
  }

  return json.data;
}
