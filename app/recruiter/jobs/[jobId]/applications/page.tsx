"use client"

import { useParams } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import { Mail, Clock, FileText, Check, X } from "lucide-react"
import {
  JOB_APPLICATIONS_QUERY,
  UPDATE_APPLICATION_STATUS_MUTATION,
} from "@/lib/graphql/operations"

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

function isApplied(status: string) {
  return status === "APPLIED"
}

export default function JobApplicantsPage() {
  const params = useParams()
  const jobId = params.jobId as string

  const { data, loading, refetch } = useQuery(JOB_APPLICATIONS_QUERY, {
    variables: { jobId },
    skip: !jobId,
  })

  const [updateStatus] = useMutation(UPDATE_APPLICATION_STATUS_MUTATION)

  const applications = data?.jobApplications ?? []

  async function handleStatusUpdate(
    applicationId: string,
    status: "SHORTLISTED" | "REJECTED"
  ) {
    try {
      await updateStatus({
        variables: { input: { applicationId, status } },
      })
      refetch()
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  if (loading) {
    return <div className="p-10">Loading applicants...</div>
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Job Applicants</h1>

        {applications.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            No applications yet.
          </div>
        )}

        <div className="space-y-4">
          {applications.map((app: {
            id: string
            resumeUrl: string | null
            coverNote: string | null
            status: string
            createdAt: string
            applicant?: {
              fullName: string | null
              email: string
              headline: string | null
            }
            job?: {
              title: string
              location: string
              employmentType: string
              company?: { name: string } | null
              companyName?: string
            }
          }) => (
            <div key={app.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-blue-600">
                    {app.applicant?.fullName || "Candidate"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {app.applicant?.headline || "—"}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full capitalize ${
                    app.status === "SHORTLISTED"
                      ? "bg-green-100 text-green-700"
                      : app.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {formatStatus(app.status)}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-3">
                <span className="flex items-center gap-1">
                  <Mail size={12} />
                  {app.applicant?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm border-t pt-4">
                <div>
                  <span className="font-semibold">Job:</span> {app.job?.title}
                </div>
                <div>
                  <span className="font-semibold">Location:</span> {app.job?.location}
                </div>
                <div>
                  <span className="font-semibold">Employment Type:</span>{" "}
                  {app.job?.employmentType}
                </div>
              </div>

              {app.coverNote && (
                <div className="mt-5">
                  <p className="font-semibold mb-2">Cover Note</p>
                  <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700">
                    {app.coverNote}
                  </div>
                </div>
              )}

              {app.resumeUrl && (
                <div className="mt-5">
                  <p className="font-semibold mb-2">Resume</p>
                  <a
                    href={`${app.resumeUrl}?dl=1`}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText size={18} />
                    Download Resume
                  </a>
                </div>
              )}

              <hr className="my-5" />
              {isApplied(app.status) && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleStatusUpdate(app.id, "SHORTLISTED")}
                    className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded text-sm"
                  >
                    <Check size={14} />
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(app.id, "REJECTED")}
                    className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded text-sm"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
