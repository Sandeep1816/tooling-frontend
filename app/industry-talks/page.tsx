import IndustryTalkListing from "@/components/IndustryTalkListing"
import { fetchPostsList } from "@/lib/graphql/posts"

export default async function IndustryTalksPage() {
  const posts = await fetchPostsList(50, { categorySlug: "industry-talks" })

  return (
    <main className="bg-white">
      <IndustryTalkListing posts={posts} />
    </main>
  )
}