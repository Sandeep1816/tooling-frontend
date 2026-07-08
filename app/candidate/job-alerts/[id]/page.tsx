"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@/lib/apollo/hooks"
import { ArrowLeft, MapPin, Briefcase } from "lucide-react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"
import { JOB_ALERT_MATCHES_QUERY } from "@/lib/graphql/operations"

export default function AlertMatchesPage() {
  useCandidateGuard()

  const { id } = useParams<{ id: string }>()

  const { data, loading } = useQuery(JOB_ALERT_MATCHES_QUERY, {
    variables: { alertId: id },
    skip: !id,
  })

  const jobs = data?.jobAlertMatches ?? []

  if (loading) {
    return <div className="p-10">Loading matching jobs...</div>
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          href="/candidate/job-alerts"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <ArrowLeft size={14} />
          Back to job alerts
        </Link>

        <h1 className="text-2xl font-bold mb-6">Matching Jobs</h1>

        {jobs.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            No jobs match this alert right now. Check back later.
          </div>
        )}

        <div className="space-y-4">
          {jobs.map((job: {
            id: string
            title: string
            slug: string
            location: string
            employmentType: string
            company?: { name: string; slug: string }
            companyName?: string
          }) => (
            <div key={job.id} className="bg-white rounded-lg shadow-sm p-5">
              {job.company?.slug ? (
                <Link
                  href={`/company/${job.company.slug}`}
                  className="font-semibold text-sm text-blue-600 hover:underline"
                >
                  {job.company?.name || job.companyName || "Company"}
                </Link>
              ) : (
                <span className="font-semibold text-sm text-gray-700">
                  {job.company?.name || job.companyName || "Company"}
                </span>
              )}

              <Link
                href={`/jobs/${job.slug}`}
                className="block text-lg font-medium mt-1 hover:underline"
              >
                {job.title}
              </Link>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {job.employmentType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
