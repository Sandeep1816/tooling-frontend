import Link from "next/link"
import Image from "next/image"
import SupplierAds from "@/components/SupplierAds"
import NewsletterForm from "@/components/news/NewsletterForm"
import { fetchPostsList, categorySlugOf } from "@/lib/graphql/posts"
import { resolveMediaUrl } from "@/lib/media"

export default async function NewsPage() {
  const posts = await fetchPostsList(50)

  // ================= WHAT'S NEW =================
  const whatsNewPosts = posts
    .filter((p) => categorySlugOf(p).includes("whatsnew"))
    .slice(0, 5)

  const newsPosts = posts.filter(
    (p) => categorySlugOf(p) === "news"
  )

  return (
    <main className="bg-white">

      {/* ================= WHAT'S NEW STRIP ================= */}
      <section className="border-b border-gray-200">
        <div className="max-w-[1320px] mx-auto px-6 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {whatsNewPosts.map((post) => (
            <Link key={post.id} href={`/post/${post.slug}`}>
              <p className="text-sm font-semibold hover:text-[#C8102E]">
                {post.title}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <NewsletterForm />

      {/* ================= NEWS LIST ================= */}
      <section className="max-w-[1320px] mx-auto px-6 py-16">
        <h1 className="text-[36px] font-bold text-[#003B5C] mb-10">
          News
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">

          {/* LEFT */}
          <div className="space-y-12">
            {newsPosts.map((post) => (
              <article
                key={post.id}
                className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 pb-10 border-b"
              >
               <div className="relative w-full h-[160px]">
  <Image
    src={resolveMediaUrl(post.imageUrl)}
    alt={post.title}
    fill
    className="object-cover rounded"
    sizes="(max-width:768px) 100vw, 260px"
  />
</div>

                <div>
                  <span className="text-xs text-gray-500 block mb-1">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>

                  <h2 className="text-[22px] font-bold mb-2">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 mb-3">
                    {post.excerpt ||
                      post.content
                        ?.replace(/<[^>]+>/g, "")
                        .slice(0, 140) + "..."}
                  </p>

                  <Link
                    href={`/post/${post.slug}`}
                    className="text-[#0072BC] font-bold uppercase text-sm"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}

            {/* PAGINATION */}
            <div className="flex gap-2">
              <button className="border px-3 py-2">‹</button>
              <button className="border px-3 py-2 bg-[#003B5C] text-white">1</button>
              <button className="border px-3 py-2">2</button>
              <button className="border px-3 py-2">3</button>
              <button className="border px-3 py-2">›</button>
            </div>
          </div>

          {/* RIGHT ADS */}
          <aside className="sticky top-24 space-y-6">
            <SupplierAds />
          </aside>
        </div>
      </section>
    </main>
  )
}
