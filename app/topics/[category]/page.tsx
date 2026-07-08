import TopicsListing from "@/components/TopicsListing";
import { fetchPostsList } from "@/lib/graphql/posts";

type Props = {
  params: {
    category: string;
  };
};

export default async function TopicCategoryPage({ params }: Props) {
  const posts = await fetchPostsList(50, { categorySlug: params.category });

  return (
    <TopicsListing
      posts={posts}
      activeCategory={params.category}
    />
  );
}
