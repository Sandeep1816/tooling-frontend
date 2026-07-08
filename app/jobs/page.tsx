"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Briefcase } from "lucide-react"
import { graphqlRequest } from "@/lib/graphql/server"

type Job = {
  id: string
  title: string
  slug: string
  location: string
  employmentType: string
  company?: { name: string }
  companyName?: string
}

const JOBS_PAGE_QUERY = `
  query Jobs($first: Int, $filter: JobsFilterInput) {
    jobs(first: $first, filter: $filter, sort: { field: CREATED_AT, order: DESC }) {
      edges {
        node {
          id
          title
          slug
          location
          employmentType
          companyName
          company { name }
        }
      }
    }
  }
`

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    graphqlRequest<{ jobs: { edges: { node: Job }[] } }>(JOBS_PAGE_QUERY, {
      first: 100,
      filter: { isActive: true },
    })
      .then((data) => setJobs(data.jobs.edges.map((e) => e.node)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-10">Loading jobs...</div>
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Jobs</h1>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.id}
            href={`/jobs/${job.slug}`}
            className="block border rounded-md p-6 hover:shadow transition"
          >
            <h2 className="text-xl font-semibold mb-2">{job.title}</h2>

            <div className="flex gap-6 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {job.location}
              </span>

              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {job.employmentType}
              </span>

              {(job.company?.name || job.companyName) && (
                <span className="font-medium">
                  {job.company?.name || job.companyName}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
