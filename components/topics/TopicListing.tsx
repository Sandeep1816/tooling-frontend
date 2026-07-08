"use client"

import { resolveMediaUrl } from "@/lib/media";
import Image from "next/image"
import Link from "next/link"
import { Post } from "@/types/Post"
import SupplierAds from "@/components/SupplierAds"

type Props = {
  posts: Post[]
  title: string
  description: string
  sectionTitle: string
}

export default function TopicListing({
  posts,
  title,
  description,
  sectionTitle,
}: Props) {
  if (!posts.length) return null

  const [hero, ...rest] = posts
  const gridPosts = rest.slice(0, 6)

  const getImage = (post: Post) =>
    resolveMediaUrl(post.imageUrl)

  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : ""

  return (
    <section className="bg-[#E6EAED]">
      <div className="max-w-7xl mx-auto px-6 pt-12">

        {/* ================= HERO ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_300px] gap-10 items-start">

          {/* LEFT TEXT */}
          <div>
            <h1
              className="text-[36px] font-bold text-[#003B5C] mb-4 leading-tight"
              style={{ fontFamily: "Oswald, Helvetica Neue, Helvetica, Arial, sans-serif" }}
            >
              {title}
            </h1>

            <p className="text-[15px] text-[#333] leading-relaxed">
              {description}
            </p>
          </div>

          {/* HERO IMAGE */}
          <Link
            href={`/post/${hero.slug}`}
            className="relative block h-[420px] overflow-hidden"
          >
            <Image
              src={getImage(hero)}
              alt={hero.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 50vw"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              {hero.badge && (
                <span className="inline-block bg-[#0072BC] text-xs font-bold px-3 py-1 mb-3 uppercase">
                  {hero.badge}
                </span>
              )}

              <h2
                className="text-[26px] font-bold leading-snug mb-2"
                style={{ fontFamily: "Oswald, Helvetica Neue, Helvetica, Arial, sans-serif" }}
              >
                {hero.title}
              </h2>

              <p className="text-sm text-gray-200 mb-3 max-w-2xl">
                {hero.excerpt || hero.content?.substring(0, 150) + "..."}
              </p>

              <span className="text-[#C8102E] font-bold text-sm uppercase">
                Read More →
              </span>
            </div>
          </Link>

          {/* RIGHT STATIC AD */}
          <aside className="space-y-6">
            <div className="relative w-full h-[420px]">
              <Image
                src="/images/PTXPO26_RegNow.png"
                alt="Advertisement"
                fill
                className="object-contain"
                sizes="300px"
              />
            </div>
          </aside>

        </div>
      </div>

      {/* ================= BLUE BAR ================= */}
      <div className="bg-[#003B5C] mt-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-10">
          <span className="text-white font-bold uppercase text-sm">News</span>
          <span className="text-white/70 font-bold uppercase text-sm">
            Featured
          </span>
        </div>
      </div>

      {/* ================= POSTS GRID ================= */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* POSTS */}
          <div>
            <h2
              className="text-[28px] font-bold text-[#003B5C] mb-6"
              style={{ fontFamily: "Oswald, Helvetica Neue, Helvetica, Arial, sans-serif" }}
            >
              {sectionTitle}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <article key={post.id}>
                  <div className="relative w-full h-[180px] mb-3">
                    <Image
                      src={getImage(post)}
                      alt={post.title}
                      fill
                      className="object-cover border"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>

                  <span className="block text-xs text-gray-500 mb-1">
                    {formatDate(post.publishedAt ?? undefined)}
                  </span>

                  <h3
                    className="text-[18px] font-bold leading-snug mb-2"
                    style={{ fontFamily: "Oswald, Helvetica Neue, Helvetica, Arial, sans-serif" }}
                  >
                    {post.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-3">
                    {post.excerpt || post.content?.substring(0, 110) + "..."}
                  </p>

                  <Link
                    href={`/post/${post.slug}`}
                    className="text-[#0072BC] font-bold text-sm uppercase"
                  >
                    Read More →
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* ADS */}
          <aside className="space-y-6 sticky top-24">
            <SupplierAds />
          </aside>

        </div>
      </div>
    </section>
  )
}