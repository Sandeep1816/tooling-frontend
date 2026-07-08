import { getGraphqlOrigin, getBannerClickUrl, getBannerImpressionUrl } from "./graphql/server";

export { getBannerClickUrl, getBannerImpressionUrl };

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${getGraphqlOrigin()}${path}`;
}
