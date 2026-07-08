"use client"
import Image from "next/image"
import { useQuery } from "@/lib/apollo/hooks"
import Link from "next/link"
import { MAGAZINES_QUERY } from "@/lib/graphql/operations"

type Magazine = {
  id: string
  title: string
  slug: string
  coverImageUrl?: string
  createdAt?: string
}

type Props = {
  magazines?: Magazine[]
  limit?: number
  showTitle?: boolean
  variant?: "grid" | "featured"
}

export default function MagazineGrid({
  magazines: initialMagazines,
  limit,
  showTitle = true,
  variant = "grid",
}: Props) {
  const { data, loading: queryLoading } = useQuery(MAGAZINES_QUERY, {
    skip: !!initialMagazines,
  })

  const magazines: Magazine[] = initialMagazines ?? data?.magazines ?? []
  const loading = !initialMagazines && queryLoading

  if (loading) return <p>Loading...</p>

  const displayMagazines = limit ? magazines.slice(0, limit) : magazines

  if (variant === "featured" && displayMagazines.length > 0) {
    const mag = displayMagazines[0]

    return (
      <div className="p-10 flex flex-col justify-center">
        <h2 className="text-[28px] font-bold text-[#003B5C] mb-8">
          Latest Issue
        </h2>

        <Link href={`/magazines/${mag.slug}`}>
          <div className="relative w-[220px] h-[300px] mb-6">
            <Image
              src={mag.coverImageUrl || "/placeholder.svg"}
              alt={mag.title}
              fill
              priority
              className="object-contain shadow-xl cursor-pointer"
              sizes="220px"
            />
          </div>
        </Link>

        <p className="text-[#003B5C] font-semibold mb-2">
          {mag.createdAt
            ? new Date(mag.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : ""}
        </p>

        <span className="inline-block bg-[#C70000] text-white text-xs font-bold px-3 py-2 w-fit">
          DIGITAL EDITION
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {showTitle && <h2 className="text-3xl font-bold">Digital Magazines</h2>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayMagazines.map((mag) => (
          <Link key={mag.id} href={`/magazines/${mag.slug}`}>
            <div className="overflow-hidden shadow hover:shadow-lg transition cursor-pointer">
              {mag.coverImageUrl && (
                <div className="relative w-full h-64">
                  <Image
                    src={mag.coverImageUrl}
                    alt={mag.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 33vw"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg">{mag.title}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
