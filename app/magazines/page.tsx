// import MagazineGrid from "@/components/magazine/MagazineGrid"

// export default function MagazinesPage() {
//   return (
//     <div className="max-w-6xl mx-auto py-12 px-6">
//       <MagazineGrid />
//     </div>
//   )
// }


import MagazineWithCoverStory from "@/components/magazine/MagazineWithCoverStory"
import MagazineArchive from "@/components/magazine/MagazineArchive"
import InThisIssue from "@/components/magazine/InThisIssue"
import { graphqlRequest } from "@/lib/graphql/server"
import { POSTS_LIST_QUERY } from "@/lib/graphql/queries"
import type { Post } from "@/types/Post"

export default async function MagazinesPage() {
  const data = await graphqlRequest<{
    posts: {
      edges: { node: Post }[]
    }
  }>(POSTS_LIST_QUERY, { first: 50, page: 1 })

  const posts: Post[] = data.posts?.edges?.map((e) => e.node) ?? []

  return (
    <>
      {/* Top Section */}
      <MagazineWithCoverStory />

      {/* In This Issue Section */}
      <InThisIssue posts={posts} />

      {/* Archive Section */}
      <MagazineArchive />
    </>

  )
}

