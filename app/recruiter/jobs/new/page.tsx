"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation } from "@/lib/apollo/hooks"
import "react-quill-new/dist/quill.snow.css"
import { fetchJobPostingEligibility, type JobPostingEligibility } from "@/lib/jobPosting"
import { CREATE_JOB_MUTATION } from "@/lib/graphql/operations"

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
})

export default function CreateJobPage() {
  const router = useRouter()

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

  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [eligibility, setEligibility] = useState<JobPostingEligibility | null>(null)
  const [error, setError] = useState("")
  const [createJob, { loading }] = useMutation(CREATE_JOB_MUTATION)

  useEffect(() => {
    async function checkEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }
        setEligibility(await fetchJobPostingEligibility(token))
      } catch {
        setError("Failed to verify your job posting allowance")
      } finally {
        setCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [router])

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

      await createJob({
        variables: {
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
      const message = err instanceof Error ? err.message : "Failed to create job"
      if (message.toLowerCase().includes("limit")) {
        const token = localStorage.getItem("token")
        if (token) {
          try {
            setEligibility(await fetchJobPostingEligibility(token))
          } catch {
            /* ignore */
          }
        }
      }
      setError(message)
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

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold mb-6">Create Job</h1>

      {checkingEligibility ? (
        <p className="text-gray-600">Checking your job posting allowance...</p>
      ) : !eligibility?.canPost ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">
            Job posting limit reached
          </h2>
          <p className="mt-2 text-sm text-amber-800">
            {eligibility?.message ||
              "You've reached your job posting limit. Upgrade your package to post more jobs."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/packages"
              className="rounded-lg bg-[#004d73] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#003a59]"
            >
              View Packages
            </Link>
            <Link
              href="/recruiter/dashboard"
              className="rounded-lg border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <>
          {eligibility?.message && (
            <p className="mb-4 text-sm text-gray-600">{eligibility.message}</p>
          )}

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
              {eligibility?.upgradeRequired && (
                <div className="mt-3">
                  <Link href="/packages" className="font-semibold text-[#004d73] hover:underline">
                    Upgrade package →
                  </Link>
                </div>
              )}
            </div>
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
              {loading ? "Publishing..." : "Publish Job"}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
