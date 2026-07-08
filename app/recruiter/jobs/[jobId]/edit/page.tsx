"use client"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import "react-quill-new/dist/quill.snow.css"
import { JOB_BY_ID_QUERY, UPDATE_JOB_MUTATION } from "@/lib/graphql/operations"

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
})

export default function EditJobPage() {
  const router = useRouter()
  const { jobId } = useParams<{ jobId: string }>()

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    employmentType: "Full-time",
    experience: "",
    salaryRange: "",
    location: "",
    isRemote: false,
  })

  const [error, setError] = useState("")

  const { data, loading: loadingJob } = useQuery(JOB_BY_ID_QUERY, {
    variables: { id: jobId },
    skip: !jobId,
  })

  const [updateJob, { loading }] = useMutation(UPDATE_JOB_MUTATION)

  useEffect(() => {
    const job = data?.jobById
    if (!job) return

    setForm({
      title: job.title,
      slug: job.slug,
      description: job.description,
      employmentType: job.employmentType,
      experience: job.experience ?? "",
      salaryRange: job.salaryRange ?? "",
      location: job.location,
      isRemote: job.isRemote,
    })
  }, [data])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target
    setForm({
      ...form,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    })
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    setForm((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      await updateJob({
        variables: {
          id: jobId,
          input: {
            title: form.title,
            slug: form.slug,
            description: form.description,
            employmentType: form.employmentType,
            experience: form.experience || undefined,
            salaryRange: form.salaryRange || undefined,
            location: form.location,
            isRemote: form.isRemote,
          },
        },
      })

      router.push("/recruiter/jobs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update job")
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  }

  if (loadingJob) {
    return <div className="p-10">Loading job...</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="title"
          required
          placeholder="Job Title"
          className="w-full border p-3 rounded"
          value={form.title}
          onChange={handleTitleChange}
        />

        <input
          name="slug"
          required
          readOnly
          className="w-full border p-3 rounded bg-gray-100"
          value={form.slug}
        />

        <select
          name="employmentType"
          className="w-full border p-3 rounded"
          value={form.employmentType}
          onChange={handleChange}
        >
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>

        <input
          name="experience"
          placeholder="Experience (e.g. 2-5 years)"
          className="w-full border p-3 rounded"
          value={form.experience}
          onChange={handleChange}
        />

        <input
          name="salaryRange"
          placeholder="Salary Range (e.g. ₹6L - ₹12L)"
          className="w-full border p-3 rounded"
          value={form.salaryRange}
          onChange={handleChange}
        />

        <input
          name="location"
          required
          placeholder="Location"
          className="w-full border p-3 rounded"
          value={form.location}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isRemote"
            checked={form.isRemote}
            onChange={handleChange}
          />
          Remote Job
        </label>

        <div>
          <label className="block font-semibold mb-2">Job Description</label>
          <ReactQuill
            theme="snow"
            value={form.description}
            onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
            className="bg-white"
          />
        </div>

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
