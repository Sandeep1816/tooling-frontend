import PodcastListing from "@/components/PodcastListing"
import { fetchPostsList, categorySlugOf } from "@/lib/graphql/posts"

export default async function PodcastPage() {
  const posts = await fetchPostsList(50)

  const podcastPosts = posts.filter((p) =>
    categorySlugOf(p).includes("podcast")
  )

  return (
    <main className="bg-white">
      <PodcastListing posts={podcastPosts} />
    </main>
  )
}
