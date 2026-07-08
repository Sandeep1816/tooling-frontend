"use client"

import Link from "next/link"
import { useQuery } from "@/lib/apollo/hooks"
import { Briefcase, MapPin, Clock } from "lucide-react"
import { useCandidateGuard } from "@/lib/useCandidateGuard"
import { MY_APPLICATIONS_QUERY } from "@/lib/graphql/operations"

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ")
}

export default function MyApplicationsPage() {
  useCandidateGuard()

  const { data, loading } = useQuery(MY_APPLICATIONS_QUERY)
  const applications = data?.myApplications ?? []

  if (loading) {
    return <div className="p-10">Loading applications...</div>
  }

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>

        {applications.length === 0 && (
          <div className="bg-white p-6 rounded shadow-sm text-gray-500">
            You haven&apos;t applied to any jobs yet.
          </div>
        )}

        <div className="space-y-4">
          {applications.map((app: {
            id: string
            status: string
            createdAt: string
            job?: {
              title: string
              slug: string
              location: string
              companyName?: string
              company?: { name: string; slug: string }
            }
          }) => (
            <div key={app.id} className="bg-white rounded-lg shadow-sm p-5">
              {app.job?.company?.slug ? (
                <Link
                  href={`/company/${app.job.company.slug}`}
                  className="font-semibold text-sm text-blue-600 hover:underline"
                >
                  {app.job?.company?.name ?? app.job?.companyName ?? "Unknown Company"}
                </Link>
              ) : (
                <span className="font-semibold text-sm text-gray-700">
                  {app.job?.company?.name ?? app.job?.companyName ?? "Unknown Company"}
                </span>
              )}

              <Link
                href={`/jobs/${app.job?.slug ?? ""}`}
                className="block text-lg font-medium mt-1 hover:underline"
              >
                {app.job?.title}
              </Link>

              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {app.job?.location}
                </span>

                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Applied on {new Date(app.createdAt).toLocaleDateString()}
                </span>

                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  Status:{" "}
                  <span className="font-medium capitalize text-blue-600">
                    {formatStatus(app.status)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
