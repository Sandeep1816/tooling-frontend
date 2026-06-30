"use client"

import { useEffect, useState } from "react"
import { MapPin, Users, Eye, Pencil } from "lucide-react"
import Link from "next/link"
import { useRecruiterGuard } from "@/lib/useRecruiterGuard"

type Job = {
  id: number
  title: string
  slug: string
  location: string
  employmentType?: string
}

export default function MyJobsPage() {
  const allowed = useRecruiterGuard()

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!allowed) return

    async function loadJobs() {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          console.error("Auth token missing")
          return
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/recruiter/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        )

        if (!res.ok) {
          throw new Error("Failed to fetch recruiter jobs")
        }

        const data = await res.json()
        setJobs(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to load recruiter jobs", err)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [allowed])

  if (!allowed) return null

  if (loading) {
    return <div className="p-10">Loading jobs...</div>
  }

  if (jobs.length === 0) {
    return <div className="p-10">No jobs posted yet.</div>
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
      <div className="max-w-[1200px] mx-auto">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Jobs</h1>

          <Link
            href="/recruiter/jobs/new"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Post Job
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between mb-3">
                <h2 className="text-lg font-semibold">{job.title}</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600">
                  Active
                </span>
              </div>

              <div className="flex gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {job.location}
                </span>

                {job.employmentType && (
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {job.employmentType}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">
                  Posted recently
                </span>

                <div className="flex gap-3">
                  <Link
                    href={`/jobs/${job.slug}`}
                    className="flex items-center gap-1 text-sm text-blue-600"
                  >
                    <Eye size={14} /> View
                  </Link>

                  <Link
                    href={`/recruiter/jobs/${job.id}/edit`}
                    className="flex items-center gap-1 text-sm text-green-600"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>

                  <Link
                    href={`/recruiter/jobs/${job.id}/applications`}
                    className="flex items-center gap-1 text-sm text-gray-600"
                  >
                    <Users size={14} /> Applicants
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}