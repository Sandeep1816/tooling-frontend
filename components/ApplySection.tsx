"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@/lib/apollo/hooks"
import { APPLY_JOB_MUTATION } from "@/lib/graphql/operations"
import { getUploadResumeUrl } from "@/lib/graphql/server"

export function ApplySection({ jobId }: { jobId: string }) {
  const router = useRouter()
  const [coverNote, setCoverNote] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [applyJob, { loading }] = useMutation(APPLY_JOB_MUTATION)

  async function apply() {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user?.id) {
      router.push("/signup?role=candidate")
      return
    }

    setMessage("")

    try {
      const token = localStorage.getItem("token")
      let resumeUrl: string | undefined

      if (resume) {
        const formData = new FormData()
        formData.append("resume", resume)

        const uploadRes = await fetch(getUploadResumeUrl(), {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })

        const uploadData = await uploadRes.json()
        if (!uploadRes.ok) {
          setMessage(uploadData.error || "Failed to upload resume")
          return
        }
        resumeUrl = uploadData.resumeUrl
      }

      await applyJob({
        variables: {
          input: {
            jobId,
            coverNote: coverNote || undefined,
            resumeUrl,
          },
        },
      })

      setMessage("✅ Successfully applied!")
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to apply")
    }
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Apply for this job</h3>

      <div className="space-y-4">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            if (e.target.files?.length) {
              setResume(e.target.files[0])
            }
          }}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <textarea
          placeholder="Cover note (optional)"
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          rows={4}
          className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={apply}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Applying..." : "Apply Now"}
        </button>

        {message && <p className="text-sm mt-3 text-center">{message}</p>}
      </div>
    </div>
  )
}
