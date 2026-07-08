import VideoListing from "@/components/VideoListing"
import { fetchPostsList, categorySlugOf } from "@/lib/graphql/posts"

export default async function VideosPage() {
  const posts = await fetchPostsList(50)

  const videoPosts = posts.filter((p) =>
    categorySlugOf(p).includes("videos")
  )

  return (
    <main className="bg-white">
      <VideoListing posts={videoPosts} />
    </main>
  )
}
