"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { MapPin, Briefcase } from "lucide-react"
import CompanyTabs from "@/components/company/CompanyTabs"
import CompanyHeader from "@/components/company/CompanyHeader"
import { useCompanyProfile } from "@/lib/company/useCompanyProfile"

export default function CompanyJobsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { company, loading, following, toggleFollow } = useCompanyProfile(slug)

  if (loading) return <div className="p-10">Loading…</div>
  if (!company) return <div className="p-10 text-center">Company not found</div>

  const jobs = company.jobs ?? []

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        <CompanyHeader 
          company={company}
          isFollowing={following}
          onFollow={toggleFollow}
        />

        <CompanyTabs slug={company.slug} active="jobs" />

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Open Jobs ({jobs.length})</h2>

          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No active jobs at the moment.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: {
                id: string
                title: string
                slug: string
                location: string
                employmentType: string
                isRemote?: boolean
              }) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="block border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium">{job.title}</p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                    <MapPin size={14} />
                    {job.location} · {job.employmentType}
                    {job.isRemote && " · Remote"}
                  </p>
                  <span className="text-sm text-blue-600 mt-2 inline-flex items-center gap-1">
                    <Briefcase size={14} />
                    View job
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
