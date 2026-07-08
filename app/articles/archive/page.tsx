import FeaturesListing from "@/components/FeaturesListing"
import ArchiveListing from "@/components/ArchiveListing"
import { fetchPostsList, categorySlugOf } from "@/lib/graphql/posts"

export default async function ArticlesArchivePage() {
  const posts = await fetchPostsList(50)

  const featurePosts = posts.filter((p) =>
    categorySlugOf(p).includes("feature")
  )

  const archivePosts = posts.filter((p) =>
    categorySlugOf(p).includes("archive")
  )

  return (
    <main className="bg-white pt-[90px]">
      {/* 🔝 FEATURES FIRST */}
      <FeaturesListing posts={featurePosts} />

      {/* 🔽 ARCHIVE BELOW */}
      <ArchiveListing posts={archivePosts} />
    </main>
  )
}
