"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLazyQuery, useMutation } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import {
  INDUSTRIES_QUERY,
  RECRUITER_ME_QUERY,
  UPDATE_COMPANY_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/lib/graphql/operations"
import { getUploadUrl } from "@/lib/graphql/server"
import { resolveMediaUrl } from "@/lib/media"
import { getGraphQLErrorMessage } from "@/lib/auth/session"

type Industry = {
  id: string
  name: string
}

export default function EditRecruiterProfile() {
  const router = useRouter()

  const [industries, setIndustries] = useState<Industry[]>([])
  const [userId, setUserId] = useState("")
  const [companyId, setCompanyId] = useState("")

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    about: "",
    location: "",
    websiteUrl: "",
    avatarUrl: "",

    companyName: "",
    companyTagline: "",
    companyDescription: "",
    companyIndustryId: "",
    companyLocation: "",
    companyAddress: "",
    companySize: "",
    companyWebsite: "",
    companyLogoUrl: "",
    companyCoverImageUrl: "",
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [loadProfile] = useLazyQuery(RECRUITER_ME_QUERY, { fetchPolicy: "network-only" })
  const [loadIndustries] = useLazyQuery(INDUSTRIES_QUERY)
  const [updateUser] = useMutation(UPDATE_USER_MUTATION)
  const [updateCompany] = useMutation(UPDATE_COMPANY_MUTATION)

  useEffect(() => {
    async function loadData() {
      const [profileResult, industryResult] = await Promise.all([
        loadProfile(),
        loadIndustries(),
      ])

      const profile = profileResult.data?.me
      const industryData = industryResult.data?.industries

      setIndustries(industryData || [])

      if (!profile) return

      setUserId(profile.id)
      setCompanyId(profile.companyId || profile.company?.id || "")

      setForm({
        fullName: profile.fullName || "",
        headline: profile.headline || "",
        about: profile.about || "",
        location: profile.location || "",
        websiteUrl: profile.websiteUrl || "",
        avatarUrl: profile.avatarUrl || "",

        companyName: profile.company?.name || "",
        companyTagline: profile.company?.tagline || "",
        companyDescription: profile.company?.description || "",
        companyIndustryId: profile.company?.industryId?.toString() || "",
        companyLocation: profile.company?.location || "",
        companyAddress: profile.company?.address || "",
        companySize: profile.company?.companySize || "",
        companyWebsite: profile.company?.website || "",
        companyLogoUrl: profile.company?.logoUrl || "",
        companyCoverImageUrl: profile.company?.coverImageUrl || "",
      })
    }

    loadData()
  }, [loadProfile, loadIndustries])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleImageUpload(file: File, field: string) {
    try {
      setUploading(true)
      const token = localStorage.getItem("token")

      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(getUploadUrl(), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error()

      setForm((prev) => ({
        ...prev,
        [field]: data.imageUrl,
      }))
    } catch {
      alert("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      if (!userId) {
        setError("Profile not loaded")
        return
      }

      await updateUser({
        variables: {
          id: userId,
          input: {
            fullName: form.fullName || undefined,
            headline: form.headline || undefined,
            about: form.about || undefined,
            location: form.location || undefined,
            websiteUrl: form.websiteUrl || undefined,
            avatarUrl: form.avatarUrl || undefined,
          },
        },
      })

      if (companyId) {
        await updateCompany({
          variables: {
            id: companyId,
            input: {
              name: form.companyName || undefined,
              tagline: form.companyTagline || undefined,
              description: form.companyDescription || undefined,
              industryId: form.companyIndustryId || undefined,
              location: form.companyLocation || undefined,
              address: form.companyAddress || undefined,
              companySize: form.companySize || undefined,
              website: form.companyWebsite || undefined,
              logoUrl: form.companyLogoUrl || undefined,
              coverImageUrl: form.companyCoverImageUrl || undefined,
            },
          },
        })
      }

      setSuccess("Profile & Company updated successfully 🎉")

      setTimeout(() => {
        router.push("/recruiter/dashboard")
      }, 1200)
    } catch (err) {
      setError(getGraphQLErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Edit Profile & Company
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <SectionTitle title="Company Owner Information" />

          <UploadBox
            label={uploading ? "Uploading..." : "Profile Avatar"}
            value={form.avatarUrl ? resolveMediaUrl(form.avatarUrl) : ""}
            onUpload={(file) => handleImageUpload(file, "avatarUrl")}
            height="h-40"
            accept="image/*"
          />

          <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} />
          <Input label="Headline" name="headline" value={form.headline} onChange={handleChange} />
          <Input label="Location" name="location" value={form.location} onChange={handleChange} />
          <Input label="Website URL" name="websiteUrl" value={form.websiteUrl} onChange={handleChange} />

          <Textarea label="About" name="about" value={form.about} onChange={handleChange} />

          <SectionTitle title="Company Information" />

          <UploadBox
            label="Company Logo"
            value={form.companyLogoUrl ? resolveMediaUrl(form.companyLogoUrl) : ""}
            onUpload={(file) => handleImageUpload(file, "companyLogoUrl")}
            height="h-32"
            accept="image/*"
          />

          <UploadBox
            label="Company Cover Image"
            value={form.companyCoverImageUrl ? resolveMediaUrl(form.companyCoverImageUrl) : ""}
            onUpload={(file) => handleImageUpload(file, "companyCoverImageUrl")}
            height="h-40"
            accept="image/*"
          />

          <Input label="Company Name" name="companyName" value={form.companyName} onChange={handleChange} />
          <Input label="Tagline" name="companyTagline" value={form.companyTagline} onChange={handleChange} />
          <Textarea label="Company Description" name="companyDescription" value={form.companyDescription} onChange={handleChange} />

          <div>
            <label className="text-sm font-medium text-gray-700">Industry</label>
            <select
              name="companyIndustryId"
              value={form.companyIndustryId}
              onChange={handleChange}
              className="w-full h-[48px] px-4 mt-1 border rounded-md"
            >
              <option value="">Select Industry</option>
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
          </div>

          <Input label="Company Location" name="companyLocation" value={form.companyLocation} onChange={handleChange} />
          <Input label="Full Address" name="companyAddress" value={form.companyAddress} onChange={handleChange} />
          <Input label="Company Size" name="companySize" value={form.companySize} onChange={handleChange} />
          <Input label="Company Website" name="companyWebsite" value={form.companyWebsite} onChange={handleChange} />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
      {title}
    </h2>
  )
}

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-[48px] px-4 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  )
}

function Textarea({
  label,
  name,
  value,
  onChange,
}: {
  label: string
  name: string
  value: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full mt-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
    </div>
  )
}
