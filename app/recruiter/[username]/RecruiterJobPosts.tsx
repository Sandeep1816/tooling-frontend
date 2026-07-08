"use client"

import { MapPin, Briefcase, Clock } from "lucide-react"
import Link from "next/link"
import { useQuery } from "@/lib/apollo/hooks"
import { JOBS_QUERY } from "@/lib/graphql/operations"

export default function RecruiterJobPosts({
  username,
}: {
  username: string
}) {
  const { data, loading } = useQuery(JOBS_QUERY, {
    variables: {
      first: 20,
      filter: { recruiterUsername: username, isActive: true },
      sort: { field: "CREATED_AT", order: "DESC" },
    },
    skip: !username,
  })

  const jobs =
    data?.jobs?.edges?.map((e: { node: Record<string, unknown> }) => e.node) ?? []

  if (loading) {
    return <p className="text-sm text-gray-500">Loading activity…</p>
  }

  if (!jobs.length) {
    return <p className="text-sm text-gray-500">No job activity yet.</p>
  }

  return (
    <div className="space-y-4">
      {jobs.map((job: {
        id: string
        title: string
        slug: string
        description: string
        location: string
        employmentType?: string
        isRemote?: boolean
      }) => (
        <div key={job.id} className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">{job.title}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Clock size={12} />
                Posted recently
              </p>
            </div>
          </div>

          <p
            className="text-sm text-gray-700 mb-3 line-clamp-3"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {job.location}
            </span>
            {job.employmentType && (
              <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                {job.employmentType}
              </span>
            )}
            {job.isRemote && (
              <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                Remote
              </span>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <Link
              href={`/jobs/${job.slug}`}
              className="text-sm text-blue-600 font-medium hover:underline"
            >
              View job
            </Link>
            <Link
              href={`/jobs/${job.slug}#apply`}
              className="text-sm text-gray-600 hover:underline"
            >
              Apply
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
