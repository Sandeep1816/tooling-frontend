"use client"

import { useMutation, useQuery } from "@/lib/apollo/hooks"
import Link from "next/link"
import { MapPin, Clock, Bookmark, ArrowLeft } from "lucide-react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"
import {
  SAVED_JOBS_QUERY,
  UNSAVE_JOB_MUTATION,
} from "@/lib/graphql/operations"

export default function SavedJobsPage() {
  useCandidateGuard()

  const { data, loading, refetch } = useQuery(SAVED_JOBS_QUERY)
  const [unsaveJob] = useMutation(UNSAVE_JOB_MUTATION)

  const savedJobs = data?.savedJobs ?? []

  async function handleUnsave(jobId: string) {
    try {
      await unsaveJob({ variables: { jobId } })
      refetch()
    } catch (err) {
      console.error("Failed to unsave job", err)
    }
  }

  if (loading) {
    return <div className="p-10">Loading saved jobs...</div>
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/candidate/feed"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back to feed
        </Link>

        <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>

        {savedJobs.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            You haven&apos;t saved any jobs yet. Browse the{" "}
            <Link href="/candidate/feed" className="text-blue-600 hover:underline">
              job feed
            </Link>{" "}
            and bookmark jobs you&apos;re interested in.
          </div>
        )}

        <div className="space-y-4">
          {savedJobs.map((saved: {
            id: string
            createdAt: string
            job: {
              id: string
              title: string
              slug: string
              location: string
              employmentType: string
              companyName?: string
              company?: { name: string; slug: string }
            }
          }) => (
            <div key={saved.id} className="bg-white rounded-lg shadow-sm p-5">
              {saved.job.company?.slug ? (
                <Link
                  href={`/company/${saved.job.company.slug}`}
                  className="font-semibold text-sm text-blue-600 hover:underline"
                >
                  {saved.job.company?.name || saved.job.companyName || "Company"}
                </Link>
              ) : (
                <span className="font-semibold text-sm text-gray-700">
                  {saved.job.company?.name || saved.job.companyName || "Company"}
                </span>
              )}

              <Link
                href={`/jobs/${saved.job.slug}`}
                className="block text-lg font-medium mt-1 hover:underline"
              >
                {saved.job.title}
              </Link>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {saved.job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Saved on {new Date(saved.createdAt).toLocaleDateString()}
                </span>
                <span>{saved.job.employmentType}</span>
              </div>

              <button
                onClick={() => handleUnsave(saved.job.id)}
                className="mt-3 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                <Bookmark size={14} className="fill-blue-600" />
                Remove from saved
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
