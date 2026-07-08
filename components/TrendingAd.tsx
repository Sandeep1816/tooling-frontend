
"use client";

import Image from "next/image";
import { getBannerClickUrl } from "@/lib/graphql/server";

type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
};

type Props = {
  banner: Banner | null;
};

export default function TrendingAd({ banner }: Props) {
  if (!banner) return null;

  return (
    <section className="py-[80px] w-full bg-[#F7F7F7]">
      <div className="max-w-[1320px] mx-auto px-[12px]">
        <p className="text-center text-[#616C74] text-sm mb-4">
          Advertisement
        </p>

        <div className="rounded-xl overflow-hidden">
          <a
            href={getBannerClickUrl(banner.id)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="relative w-full h-[218px]">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                quality={70}
                className="object-cover"
              />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
