import Image from "next/image";
import type { Post } from "@/types/Post";
import { graphqlRequest } from "@/lib/graphql/server"
import { POST_BY_SLUG_QUERY } from "@/lib/graphql/queries"
import { resolveMediaUrl } from "@/lib/media"

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  let post: Post | null = null;

  try {
    const data = await graphqlRequest<{ post: Post }>(POST_BY_SLUG_QUERY, {
      slug,
    });
    post = data.post;
  } catch {
    return <div className="p-10">Article not found</div>;
  }

  if (!post) {
    return <div className="p-10">Article not found</div>;
  }

  return (
    <main className="max-w-[1320px] mx-auto px-6 py-10">
      <h1 className="text-[36px] font-bold mb-6">
        {post.title}
      </h1>

     <div className="relative w-full h-[520px] mb-8">
  <Image
    src={resolveMediaUrl(post.imageUrl)}
    alt={post.title}
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 1320px"
    priority
  />
</div>

      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
}
