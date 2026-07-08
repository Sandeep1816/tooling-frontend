import Header from "../components/Header"
import AdBanner from "../components/AdBanner"
import PassionOnWheels from "../components/PassionOnWheels"
import LatestHero from "../components/LatestHero"
import TrendingAd from "../components/TrendingAd"
import ShopTalkAd from "../components/ShopTalkAd"
import ManufacturingConnected from "../components/ManufacturingConnected"
import BasicsSection from "../components/BasicsSection"
import VideosSection from "../components/VideosSection"
import NewsProductsSection from "../components/NewsProductsSection"
import LatestIssues from "../components/LatestIssues"
import Footer from "../components/Footer"

import type { Post } from "../types/Post"
import TrendingSection from "@/components/TrendingSection"
import CompanyArticles from "@/components/company/CompanyArticles"
import HomeCompanyArticles from "@/components/HomeCompanyArticles"
import Banner from "@/components/Banners/Banner";
import { graphqlRequest } from "@/lib/graphql/server"
import { POSTS_LIST_QUERY } from "@/lib/graphql/queries"


export default async function Home() {
  /* ================= FETCH POSTS ================= */

  let posts: Post[] = []

  try {
    const data = await graphqlRequest<{
      posts: { edges: { node: Post }[] }
    }>(POSTS_LIST_QUERY, { first: 50 })

    posts = data.posts.edges.map((edge) => edge.node)
  } catch {
    return <div className="text-center p-10">No posts available</div>
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return <div className="text-center p-10">No posts available</div>
  }

//   /* ================= FETCH BANNER ================= */

//   const bannerRes = await fetch(
//     `${process.env.NEXT_PUBLIC_API_URL}/api/banners?placement=HOME_MIDDLE`,
//     { cache: "no-store" }
//   )

//  const bannerText = await bannerRes.text()

// console.log("Banner Response:", bannerText)

// let bannerData = null

// try {
//   bannerData = JSON.parse(bannerText)
// } catch (err) {
//   console.error("Invalid JSON:", bannerText)
// }

//   const banner =
//     Array.isArray(bannerData) && bannerData.length > 0
//       ? bannerData[0]
//       : null

  /* ================= CATEGORY HELPER ================= */

  const getCategorySlug = (post: Post) =>
    typeof post.category === "object"
      ? post.category?.slug?.toLowerCase()
      : String(post.category || "").toLowerCase()

  /* ================= GROUP POSTS ================= */

  const latestPosts = posts.filter(
    (p) => getCategorySlug(p) === "latest"
  )

  const manufacturingPosts = posts.filter(
    (p) => getCategorySlug(p) === "manufacturing"
  )

  /* ================= FEATURED ================= */

  const latestPost = latestPosts[0]

  return (
    <>
       {/* ================= HOME TOP BANNER ================= */}
       <br />
      <Banner placement="HOME_TOP" />

      {/* 🏢 Company Articles */}
      <CompanyArticles  />

      {/* 📰 Latest Hero */}
      {latestPost && (
        <LatestHero post={latestPost} posts={posts} />
      )}

      {/* 🔥 Advertisement
      {banner && <TrendingAd banner={banner} />} */}

      {/* 📈 Trending */}
      <TrendingSection posts={posts} />

      {/* 📘 Basics */}
      <BasicsSection posts={posts} />

         {/* ================= HOME MIDDLE BANNER ================= */}
      <Banner placement="HOME_MIDDLE" />

      {/* 🎥 Videos */}
      <VideosSection posts={posts} />

      {/* 🏭 Manufacturing */}
      {/* <ManufacturingConnected
        posts={manufacturingPosts.slice(0, 4)}
      /> */}


      <HomeCompanyArticles />

        {/* ================= HOME BOTTOM BANNER ================= */}
      <Banner placement="HOME_BOTTOM" />
    </>
  )
}