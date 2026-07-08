"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useApolloClient, useMutation, useQuery } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import {
  ADMIN_CREATE_SUPPLIER_DIRECTORY_MUTATION,
  COMPANIES_QUERY,
  INDUSTRIES_QUERY,
  INDUSTRY_CHILDREN_QUERY,
  USERS_QUERY,
} from "@/lib/graphql/operations"
import { getGraphQLErrorMessage } from "@/lib/auth/session"
import { getUploadUrl } from "@/lib/graphql/server"

type CompanyOption = {
  id: string
  name: string
  location?: string | null
  address?: string | null
  industryId?: string | null
}

type RecruiterOption = {
  id: string
  email: string
  username: string
  companyId?: string | null
}

type IndustryOption = {
  id: string
  name: string
}

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function AdminCreateDirectoryPage() {
  const router = useRouter()
  const client = useApolloClient()

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    logoUrl: "",
    companyId: "",
    submittedById: "",
    location: "",
    address: "",
    industryId: "",
  })

  const [industryLevels, setIndustryLevels] = useState<IndustryOption[][]>([])
  const [industrySelected, setIndustrySelected] = useState<string[]>([])

  const { data: companiesData } = useQuery(COMPANIES_QUERY, {
    variables: { first: 500, sort: { field: "NAME", order: "ASC" } },
  })

  const { data: usersData } = useQuery(USERS_QUERY, {
    variables: {
      first: 500,
      filter: { role: "RECRUITER" },
      sort: { field: "USERNAME", order: "ASC" },
    },
  })

  const { data: industriesData } = useQuery(INDUSTRIES_QUERY)

  const [adminCreateDirectory, { loading }] = useMutation(
    ADMIN_CREATE_SUPPLIER_DIRECTORY_MUTATION
  )

  const companies: CompanyOption[] = useMemo(
    () => companiesData?.companies?.edges?.map((e: { node: CompanyOption }) => e.node) ?? [],
    [companiesData]
  )

  const recruiters: RecruiterOption[] = useMemo(() => {
    const all =
      usersData?.users?.edges?.map((e: { node: RecruiterOption }) => e.node) ?? []
    if (!form.companyId) return []
    return all.filter((r: RecruiterOption) => r.companyId === form.companyId)
  }, [usersData, form.companyId])

  const selectedCompany = companies.find((c) => c.id === form.companyId)

  useEffect(() => {
    if (!selectedCompany) return
    setForm((prev) => ({
      ...prev,
      location: selectedCompany.location || prev.location,
      address: selectedCompany.address || prev.address,
      industryId: selectedCompany.industryId || prev.industryId,
    }))
  }, [selectedCompany])

  useEffect(() => {
    const roots = industriesData?.industries ?? []
    if (roots.length > 0) {
      setIndustryLevels([roots])
      setIndustrySelected([])
    }
  }, [industriesData])

  async function handleIndustrySelect(levelIndex: number, industryId: string) {
    const newSelected = [...industrySelected.slice(0, levelIndex), industryId]
    const newLevels = industryLevels.slice(0, levelIndex + 1)

    setIndustrySelected(newSelected)
    setIndustryLevels(newLevels)
    setForm((prev) => ({ ...prev, industryId: "" }))

    const { data } = await client.query<{ industryChildren: IndustryOption[] }>({
      query: INDUSTRY_CHILDREN_QUERY,
      variables: { parentId: industryId },
    })

    const children = data?.industryChildren ?? []
    if (children.length > 0) {
      setIndustryLevels([...newLevels, children])
    } else {
      setForm((prev) => ({ ...prev, industryId }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.industryId) {
      alert("Please select an industry (or ensure the company has one)")
      return
    }
    if (!form.location.trim() || !form.address.trim()) {
      alert("Location and address are required")
      return
    }

    try {
      await adminCreateDirectory({
        variables: {
          input: {
            name: form.name,
            slug: form.slug,
            description: form.description,
            logoUrl: form.logoUrl || null,
            companyId: form.companyId,
            submittedById: form.submittedById,
            location: form.location,
            address: form.address,
            industryId: form.industryId,
            autoApprove: true,
          },
        },
      })
      alert("Directory created successfully")
      router.push("/admin/directories")
    } catch (err) {
      alert(getGraphQLErrorMessage(err))
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Directory (Admin)</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Select Company</label>
          <select
            className="w-full border p-2 rounded"
            value={form.companyId}
            onChange={(e) =>
              setForm({
                ...form,
                companyId: e.target.value,
                submittedById: "",
                location: "",
                address: "",
                industryId: "",
              })
            }
            required
          >
            <option value="">Select company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Select Recruiter</label>
          <select
            className="w-full border p-2 rounded"
            value={form.submittedById}
            onChange={(e) => setForm({ ...form, submittedById: e.target.value })}
            required
            disabled={!form.companyId}
          >
            <option value="">Select recruiter</option>
            {recruiters.map((rec) => (
              <option key={rec.id} value={rec.id}>
                {rec.username} ({rec.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Directory Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value
              setForm({
                ...form,
                name,
                slug: generateSlug(name),
              })
            }}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Slug</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Address</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>

        {!selectedCompany?.industryId && (
          <div className="space-y-2">
            <label className="block font-medium mb-1">Industry</label>
            {industryLevels.map((levelOptions, levelIndex) => (
              <select
                key={levelIndex}
                className="w-full border p-2 rounded"
                value={industrySelected[levelIndex] ?? ""}
                onChange={(e) => {
                  if (!e.target.value) return
                  handleIndustrySelect(levelIndex, e.target.value)
                }}
              >
                <option value="">
                  {levelIndex === 0 ? "— Select Industry —" : "— Select Sub-category —"}
                </option>
                {levelOptions.map((industry) => (
                  <option key={industry.id} value={industry.id}>
                    {industry.name}
                  </option>
                ))}
              </select>
            ))}
          </div>
        )}

        <UploadBox
          label="Directory Logo"
          value={form.logoUrl}
          onUpload={async (file) => {
            const formData = new FormData()
            formData.append("image", file)

            const token = localStorage.getItem("token")
            const res = await fetch(getUploadUrl(), {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Upload failed")

            setForm((prev) => ({
              ...prev,
              logoUrl: data.imageUrl,
            }))
          }}
        />

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-5 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Directory"}
        </button>
      </form>
    </div>
  )
}
