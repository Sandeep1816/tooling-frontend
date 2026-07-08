"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useQuery } from "@/lib/apollo/hooks"
import type { ContentLimitEligibility } from "@/lib/packageLimits"
import { fetchProductListingEligibility } from "@/lib/packageLimits"
import { MY_SUPPLIER_DIRECTORIES_QUERY } from "@/lib/graphql/operations"
import { countFilledProducts } from "@/lib/productListings"

const PackageLimitModal = dynamic(
  () => import("@/components/recruiter/PackageLimitModal"),
  { ssr: false }
)

type Directory = {
  id: string
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isLiveEditable: boolean
  productSupplies?: unknown
}

export default function RecruiterDirectoriesPage() {
  const { data, loading, error: queryError } = useQuery(MY_SUPPLIER_DIRECTORIES_QUERY)
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [error, setError] = useState("")

  const directories: Directory[] = data?.mySupplierDirectories ?? []

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setListingEligibility(await fetchProductListingEligibility(token))
      } catch (eligibilityError) {
        console.error("Eligibility load error:", eligibilityError)
      }
    }
    loadEligibility()
  }, [])

  useEffect(() => {
    if (queryError) {
      setError(queryError.message)
    }
  }, [queryError])

  if (loading) {
    return <div className="p-10">Loading directories...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Supplier Directories</h1>
        <Link
          href="/recruiter/directory/new"
          onClick={(e) => {
            if (listingEligibility && !listingEligibility.canAdd) {
              e.preventDefault()
              setShowLimitModal(true)
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Directory
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {listingEligibility?.message && (
        <p className="text-sm text-gray-600 mb-4">{listingEligibility.message}</p>
      )}

      {directories.length === 0 ? (
        <p className="text-gray-500">No directories submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {directories.map((directory) => (
            <div
              key={directory.id}
              className="bg-white border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div>
                <h2 className="font-semibold text-lg">{directory.name}</h2>
                <p className="text-sm text-gray-500">/{directory.slug}</p>
                <p className="text-sm mt-1">
                  Status:{" "}
                  <span className="font-medium capitalize">{directory.status.toLowerCase()}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Products listed: {countFilledProducts(directory.productSupplies)}
                </p>
              </div>

              <div className="flex gap-3">
                {directory.isLiveEditable && (
                  <Link
                    href={`/recruiter/directory/${directory.id}/edit`}
                    className="text-blue-600 hover:underline text-sm font-medium"
                  >
                    Edit
                  </Link>
                )}
                {directory.status === "APPROVED" && (
                  <Link
                    href={`/suppliers/${directory.slug}`}
                    className="text-green-600 hover:underline text-sm font-medium"
                  >
                    View Live
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PackageLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        title="Directory slot limit reached"
        eligibility={listingEligibility}
        usedLabel="Directories"
        usedValue={listingEligibility?.activeListings}
        limitValue={listingEligibility?.effectiveLimit}
      />
    </div>
  )
}
