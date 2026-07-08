"use client"

import { Country, State, City } from "country-state-city"
import { useEffect, useState } from "react"
import { useApolloClient, useMutation, useQuery } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import {
  ADMIN_CREATE_SUPPLIER_DIRECTORY_MUTATION,
  CREATE_COMPANY_MUTATION,
  CREATE_RECRUITER_MUTATION,
  INDUSTRIES_QUERY,
  INDUSTRY_CHILDREN_QUERY,
} from "@/lib/graphql/operations"
import { getGraphQLErrorMessage } from "@/lib/auth/session"
import { getUploadUrl } from "@/lib/graphql/server"

type IndustryOption = {
  id: string
  name: string
}

export default function FullSupplierSetup() {
  const client = useApolloClient()
  const [loading, setLoading] = useState(false)

  const DEFAULT_PASSWORD = "Company@21"

  const [form, setForm] = useState({
    companyName: "",
    website: "",
    country: "",
    state: "",
    city: "",
    address: "",
    industryId: "" as string,
    description: "",
    logoUrl: "",
    email: "",
    phoneNumber: "",
    directoryDescription: "",
    videoGallery: [""],
    socialLinks: {
      facebook: "",
      linkedin: "",
      twitter: "",
      youtube: "",
      instagram: "",
    },
  })

  const [industryLevels, setIndustryLevels] = useState<IndustryOption[][]>([])
  const [industrySelected, setIndustrySelected] = useState<string[]>([])

  const { data: industriesData } = useQuery(INDUSTRIES_QUERY)
  const [createCompany] = useMutation(CREATE_COMPANY_MUTATION)
  const [createRecruiter] = useMutation(CREATE_RECRUITER_MUTATION)
  const [adminCreateDirectory] = useMutation(ADMIN_CREATE_SUPPLIER_DIRECTORY_MUTATION)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      socialLinks: {
        ...form.socialLinks,
        [e.target.name]: e.target.value,
      },
    })
  }

  const handleVideoChange = (index: number, value: string) => {
    const updated = [...form.videoGallery]
    updated[index] = value
    setForm({ ...form, videoGallery: updated })
  }

  const addVideoField = () => {
    setForm({ ...form, videoGallery: [...form.videoGallery, ""] })
  }

  const handleLogoUpload = async (file: File) => {
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
  }

  const handleIndustrySelect = async (levelIndex: number, industryId: string) => {
    const newSelected = [...industrySelected.slice(0, levelIndex), industryId]
    const newLevels = industryLevels.slice(0, levelIndex + 1)

    setIndustrySelected(newSelected)
    setIndustryLevels(newLevels)
    setForm((prev) => ({ ...prev, industryId: "" }))

    const { data } = await client.query<{ industryChildren: { id: string; name: string }[] }>({
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

  useEffect(() => {
    const roots = industriesData?.industries ?? []
    if (roots.length > 0) {
      setIndustryLevels([roots])
      setIndustrySelected([])
    }
  }, [industriesData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!form.industryId) {
        alert("Please select an industry")
        return
      }

      if (!form.country || !form.state || !form.city) {
        alert("Please select Country, State and City")
        return
      }

      const selectedCountry = countries.find((c) => c.isoCode === form.country)
      const selectedState = states.find((s) => s.isoCode === form.state)
      const selectedCity = cities.find((c) => c.name === form.city)

      const formattedLocation = [
        selectedCity?.name,
        selectedState?.name,
        selectedCountry?.name,
      ]
        .filter(Boolean)
        .join(", ")

      const username = form.email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")

      const { data: companyResult } = await createCompany({
        variables: {
          input: {
            name: form.companyName,
            website: form.website || null,
            location: formattedLocation,
            address: form.address,
            industryId: form.industryId,
            description: form.description || null,
            logoUrl: form.logoUrl || null,
          },
        },
      })

      const company = companyResult?.createCompany
      if (!company?.id) throw new Error("Failed to create company")

      const { data: recruiterResult } = await createRecruiter({
        variables: {
          input: {
            email: form.email,
            username,
            password: DEFAULT_PASSWORD,
            companyId: company.id,
          },
        },
      })

      const recruiter = recruiterResult?.createRecruiter
      if (!recruiter?.id) throw new Error("Failed to create recruiter")

      await adminCreateDirectory({
        variables: {
          input: {
            name: form.companyName,
            description: form.directoryDescription || form.description || form.companyName,
            phoneNumber: form.phoneNumber || null,
            email: form.email,
            website: form.website || null,
            logoUrl: form.logoUrl || null,
            videoGallery: form.videoGallery.filter((v) => v.trim() !== ""),
            socialLinks: form.socialLinks,
            location: formattedLocation,
            address: form.address,
            industryId: form.industryId,
            companyId: company.id,
            submittedById: recruiter.id,
            autoApprove: true,
          },
        },
      })

      alert("Full setup created successfully ✅")
    } catch (err) {
      alert(getGraphQLErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const countries = Country.getAllCountries()
  const states = form.country ? State.getStatesOfCountry(form.country) : []
  const cities = form.state ? City.getCitiesOfState(form.country, form.state) : []

  return (
    <div className="min-h-screen bg-[#f6f8fc] py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-8 text-center">
          Create Company Supplier Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              required
            />

            <Input
              label="Company Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
            />

            <Input
              label="Website"
              name="website"
              value={form.website}
              onChange={handleChange}
            />

            <div className="space-y-1">
              <label className="text-sm text-gray-600">Country</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.country}
                onChange={(e) =>
                  setForm({
                    ...form,
                    country: e.target.value,
                    state: "",
                    city: "",
                  })
                }
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">State</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.state}
                disabled={!form.country}
                onChange={(e) =>
                  setForm({
                    ...form,
                    state: e.target.value,
                    city: "",
                  })
                }
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-600">City</label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={form.city}
                disabled={!form.state}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                  })
                }
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <Textarea
              label="Full Address"
              name="address"
              placeholder="Enter complete office address (Building, Street, Area, Landmark)"
              value={form.address}
              onChange={handleChange}
            />

            <div className="col-span-2 space-y-2">
              <label className="text-sm text-gray-600">Industry</label>

              {industryLevels.map((levelOptions, levelIndex) => (
                <select
                  key={levelIndex}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
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

              {form.industryId ? (
                <p className="text-xs text-green-600 font-medium">✅ Industry selected</p>
              ) : industrySelected.length > 0 ? (
                <p className="text-xs text-amber-500">
                  ⬇ Please continue selecting a sub-category
                </p>
              ) : null}
            </div>
          </div>

          <UploadBox
            label="Company Logo"
            value={form.logoUrl}
            onUpload={handleLogoUpload}
            accept="image/*"
          />

          <Textarea
            label="About Supplier"
            name="directoryDescription"
            placeholder="Write a compelling description for your supplier listing. Highlight your expertise, product range, and what sets you apart in the industry."
            value={form.directoryDescription}
            onChange={handleChange}
          />

          <div className="space-y-3">
            <label className="font-medium text-gray-700">Video Gallery</label>

            {form.videoGallery.map((video, index) => (
              <input
                key={index}
                type="text"
                placeholder="YouTube Video URL"
                value={video}
                onChange={(e) => handleVideoChange(index, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            ))}

            <button
              type="button"
              onClick={addVideoField}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Another Video
            </button>
          </div>

          <div className="space-y-4">
            <label className="font-medium text-gray-700">Social Media Links</label>

            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Facebook" name="facebook" value={form.socialLinks.facebook} onChange={handleSocialChange} />
              <Input label="LinkedIn" name="linkedin" value={form.socialLinks.linkedin} onChange={handleSocialChange} />
              <Input label="Twitter" name="twitter" value={form.socialLinks.twitter} onChange={handleSocialChange} />
              <Input label="YouTube" name="youtube" value={form.socialLinks.youtube} onChange={handleSocialChange} />
              <Input label="Instagram" name="instagram" value={form.socialLinks.instagram} onChange={handleSocialChange} />
            </div>
          </div>

          <div className="pt-4 text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Full Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <input {...props} className="w-full border rounded-lg px-3 py-2 text-sm" />
    </div>
  )
}

function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600">{label}</label>
      <textarea {...props} className="w-full border rounded-lg px-3 py-2 text-sm" />
    </div>
  )
}
