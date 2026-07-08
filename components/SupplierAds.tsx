"use client"

import { useQuery } from "@/lib/apollo/hooks"
import Image from "next/image"
import Link from "next/link"
import { BANNERS_BY_PLACEMENT_QUERY } from "@/lib/graphql/operations"
import { getBannerClickUrl } from "@/lib/graphql/server"

type Banner = {
  id: string
  title: string
  imageUrl: string
  targetUrl?: string | null
  placement: string
}

export default function SupplierAds() {
  const { data } = useQuery(BANNERS_BY_PLACEMENT_QUERY, {
    variables: { placement: "SIDEBAR" },
  })

  const banners: Banner[] = (data?.banners ?? []).slice(0, 3)

  return (
    <div className="space-y-6 sticky top-6">
      {banners.map((ad) => (
        <Ad key={ad.id} ad={ad} />
      ))}
    </div>
  )
}

function Ad({ ad }: { ad: Banner }) {
  return (
    <Link
      href={getBannerClickUrl(ad.id)}
      className="block bg-white"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div
        className="relative overflow-hidden mx-auto"
        style={{ width: "300px", height: "250px" }}
      >
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          fill
          sizes="300px"
          className="object-cover"
        />
      </div>
    </Link>
  )
}
