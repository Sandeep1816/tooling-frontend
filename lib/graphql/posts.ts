import type { Post } from "@/types/Post";
import { graphqlRequest } from "./server";
import { POSTS_LIST_QUERY } from "./queries";

type PostsFilter = {
  search?: string;
  categorySlug?: string;
  authorId?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  companyId?: string;
};

export async function fetchPostsList(
  first = 50,
  filter?: PostsFilter,
  options?: { token?: string; cache?: RequestCache }
): Promise<Post[]> {
  const data = await graphqlRequest<{
    posts: { edges: { node: Post }[] };
  }>(POSTS_LIST_QUERY, { first, filter }, options);

  return data.posts.edges.map((edge) => edge.node);
}

export function categorySlugOf(post: Post): string {
  return typeof post.category === "object"
    ? post.category?.slug?.toLowerCase() ?? ""
    : String(post.category || "").toLowerCase();
}
