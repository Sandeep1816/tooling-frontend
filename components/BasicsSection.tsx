"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import type { Post } from "../types/Post";
import SupplierAds from "@/components/SupplierAds";
import { resolveMediaUrl } from "@/lib/media";

/* ================= CATEGORY COLORS ================= */

const CATEGORY_COLORS: Record<string, string> = {
  basics: "bg-[#0073ff]",
  trending: "bg-[#F59E0B]",
  latest: "bg-[#F69C00]",
  video: "bg-[#EF4444]",
  engineering: "bg-[#2563EB]",
};

type Props = {
  posts: Post[];
};

export default function BasicsSection({ posts }: Props) {
  const basicsPosts = useMemo(() => {
    return posts
      .filter((p) =>
        typeof p.category === "object"
          ? p.category?.slug?.toLowerCase().includes("basics")
          : String(p.category || "").toLowerCase().includes("basics")
      )
      .slice(0, 6);
  }, [posts]);

  if (!basicsPosts.length) return null;

  const imageUrl = (post: Post) => resolveMediaUrl(post.imageUrl);

  const getTag = (post: Post) => {
    const badge = post?.badge?.trim();

    const slug =
      typeof post?.category === "object"
        ? post?.category?.slug?.toLowerCase() || ""
        : String(post?.category || "").toLowerCase();

    const matchedKey = Object.keys(CATEGORY_COLORS).find((key) =>
      slug.includes(key)
    );

    const color = matchedKey ? CATEGORY_COLORS[matchedKey] : "bg-[#0073ff]";

    return {
      text: badge,
      color,
    };
  };

  return (
    <section className="bg-[#ffffff] py-12 sm:py-16">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#121213]">
            Trending Stories
          </h2>

          <Link
            href="/basics"
            className="text-sm font-semibold uppercase text-[#0073ff]"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[8fr_4fr] gap-10">
          <div className="space-y-10">
            {basicsPosts.map((post) => {
              const tag = getTag(post);

              return (
                <article
                  key={post.id}
                  className="flex flex-col sm:flex-row gap-5 pb-10 border-b border-[#e5e5e5]"
                >
                  <Link
                    href={`/post/${post.slug}`}
                    className="relative w-full sm:w-[260px] h-[200px] sm:h-[170px] shrink-0 overflow-hidden rounded-md"
                  >
                    <Image
                      src={imageUrl(post)}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 260px"
                      quality={70}
                      className="object-cover hover:scale-105 transition"
                    />
                  </Link>

                  <div className="flex-1">
                    {tag.text && (
                      <span
                        className={`${tag.color} inline-block mb-2 text-[11px] font-bold uppercase text-white px-3 py-[2px]`}
                      >
                        {tag.text}
                      </span>
                    )}

                    <h3 className="text-lg sm:text-xl font-semibold text-[#121213] leading-snug">
                      <Link href={`/post/${post.slug}`}>{post.title}</Link>
                    </h3>

                    {post.excerpt && (
                      <p className="mt-3 text-sm sm:text-[15px] text-[#616c74] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="order-last lg:order-none">
            <div className="space-y-8">
              <SupplierAds />
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
