"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import RichTextEditor from "@/components/RichTextField"
import UploadBox from "@/components/UploadBox"
import { getUploadUrl } from "@/lib/graphql/server"
import {
  fetchProductListingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits"
import {
  SUPPLIER_BY_ID_QUERY,
  UPDATE_SUPPLIER_DIRECTORY_MUTATION,
} from "@/lib/graphql/operations"

type DirectoryForm = {
  id: string
  name: string
  slug: string
  phoneNumber: string
  email: string
  description: string
  website: string
  logoUrl: string
  coverImageUrl: string
  tradeNames: string[]
  videoGallery: string[]
  productSupplies: string[]
  socialLinks: Record<string, string>
  isLiveEditable: boolean
  companyLocation?: string
  companyIndustry?: string
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    const items = value.filter((v) => typeof v === "string")
    return items.length > 0 ? items : [""]
  }
  return [""]
}

export default function EditDirectoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data, loading } = useQuery(SUPPLIER_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  })
  const [updateDirectory] = useMutation(UPDATE_SUPPLIER_DIRECTORY_MUTATION)

  const [directory, setDirectory] = useState<DirectoryForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [listingEligibility, setListingEligibility] =
    useState<ContentLimitEligibility | null>(null)

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setListingEligibility(await fetchProductListingEligibility(token))
      } catch (error) {
        console.error("Product listing eligibility error:", error)
      }
    }
    loadEligibility()
  }, [])

  useEffect(() => {
    const supplier = data?.supplierById
    if (!supplier) return

    setDirectory({
      id: supplier.id,
      name: supplier.name ?? "",
      slug: supplier.slug ?? "",
      phoneNumber: supplier.phoneNumber ?? "",
      email: supplier.email ?? "",
      description: supplier.description ?? "",
      website: supplier.website ?? "",
      logoUrl: supplier.logoUrl ?? "",
      coverImageUrl: supplier.coverImageUrl ?? "",
      tradeNames: normalizeList(supplier.tradeNames),
      videoGallery: normalizeList(supplier.videoGallery),
      productSupplies: normalizeList(supplier.productSupplies),
      socialLinks: (supplier.socialLinks as Record<string, string>) ?? {},
      isLiveEditable: supplier.isLiveEditable ?? false,
      companyLocation: supplier.company?.location ?? "",
      companyIndustry: supplier.company?.industry?.name ?? "",
    })
  }, [data])

  async function saveChanges() {
    if (!directory?.isLiveEditable) {
      alert("Directory is not approved yet")
      return
    }

    try {
      setSaving(true)

      const socialLinks = Object.fromEntries(
        Object.entries(directory.socialLinks).filter(([, v]) => v)
      )

      await updateDirectory({
        variables: {
          id: directory.id,
          input: {
            name: directory.name,
            description: directory.description,
            website: directory.website || undefined,
            logoUrl: directory.logoUrl || undefined,
            coverImageUrl: directory.coverImageUrl || undefined,
            phoneNumber: directory.phoneNumber || undefined,
            email: directory.email || undefined,
            tradeNames: directory.tradeNames.filter(Boolean),
            videoGallery: directory.videoGallery.filter(Boolean),
            productSupplies: directory.productSupplies.filter(Boolean),
            socialLinks,
          },
        },
      })

      router.push("/recruiter/directories")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save directory")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !directory) {
    return <div className="p-10">Loading directory...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">Edit Supplier Directory</h1>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Company Name</label>
          <input
            className="input"
            value={directory.name}
            onChange={(e) => setDirectory({ ...directory, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Slug (read only)</label>
          <input className="input bg-gray-100" value={directory.slug} disabled />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Phone Number</label>
          <input
            className="input"
            value={directory.phoneNumber}
            onChange={(e) => setDirectory({ ...directory, phoneNumber: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            value={directory.email}
            onChange={(e) => setDirectory({ ...directory, email: e.target.value })}
          />
        </div>
      </div>

      {(directory.companyLocation || directory.companyIndustry) && (
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          {directory.companyLocation && (
            <div>
              <span className="font-medium text-gray-800">Location: </span>
              {directory.companyLocation}
            </div>
          )}
          {directory.companyIndustry && (
            <div>
              <span className="font-medium text-gray-800">Industry: </span>
              {directory.companyIndustry}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="label">Website</label>
        <input
          className="input"
          value={directory.website}
          onChange={(e) => setDirectory({ ...directory, website: e.target.value })}
        />
      </div>

      <div>
        <label className="label">Description</label>
        <RichTextEditor
          value={directory.description}
          onChange={(val: string) => setDirectory({ ...directory, description: val })}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <UploadBox
          label="Company Logo"
          value={directory.logoUrl}
          onUpload={async (file) => {
            const formData = new FormData()
            formData.append("image", file)
            const res = await fetch(getUploadUrl(), { method: "POST", body: formData })
            const uploadData = await res.json()
            setDirectory({ ...directory, logoUrl: uploadData.imageUrl })
          }}
        />
      </div>

      <Section title="Product Supplies">
        {listingEligibility && (
          <p className="text-sm text-gray-500 mb-3">
            Products inside your directory do not count toward your directory slot limit.
          </p>
        )}
        {directory.productSupplies.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.productSupplies]
                arr[i] = e.target.value
                setDirectory({ ...directory, productSupplies: arr })
              }}
            />
            {i > 0 && (
              <button
                type="button"
                onClick={() => {
                  const arr = directory.productSupplies.filter((_, idx) => idx !== i)
                  setDirectory({ ...directory, productSupplies: arr })
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDirectory({
              ...directory,
              productSupplies: [...directory.productSupplies, ""],
            })
          }
        >
          + Add product
        </button>
      </Section>

      <Section title="Social Media">
        <div className="grid grid-cols-2 gap-4">
          {["facebook", "linkedin", "twitter", "youtube"].map((key) => (
            <div key={key}>
              <label className="label capitalize">{key}</label>
              <input
                className="input"
                placeholder={key}
                value={directory.socialLinks?.[key] || ""}
                onChange={(e) =>
                  setDirectory({
                    ...directory,
                    socialLinks: { ...directory.socialLinks, [key]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Trade Names">
        {directory.tradeNames.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.tradeNames]
                arr[i] = e.target.value
                setDirectory({ ...directory, tradeNames: arr })
              }}
            />
            {i > 0 && (
              <button
                type="button"
                onClick={() => {
                  const arr = directory.tradeNames.filter((_, idx) => idx !== i)
                  setDirectory({ ...directory, tradeNames: arr })
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDirectory({ ...directory, tradeNames: [...directory.tradeNames, ""] })
          }
        >
          + Add trade name
        </button>
      </Section>

      <Section title="YouTube Video Links">
        {directory.videoGallery.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="input flex-1"
              value={item}
              onChange={(e) => {
                const arr = [...directory.videoGallery]
                arr[i] = e.target.value
                setDirectory({ ...directory, videoGallery: arr })
              }}
            />
            {i > 0 && (
              <button
                type="button"
                onClick={() => {
                  const arr = directory.videoGallery.filter((_, idx) => idx !== i)
                  setDirectory({ ...directory, videoGallery: arr })
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setDirectory({ ...directory, videoGallery: [...directory.videoGallery, ""] })
          }
        >
          + Add video
        </button>
      </Section>

      <button
        onClick={saveChanges}
        disabled={saving}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </div>
  )
}
