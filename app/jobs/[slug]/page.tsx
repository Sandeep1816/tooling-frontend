"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Eye,
  Building2,
  ChevronRight,
  Bookmark,
  ArrowLeft,
} from "lucide-react"
import { ApplySection } from "@/components/ApplySection"
import {
  INCREMENT_JOB_VIEW_MUTATION,
  JOB_BY_SLUG_QUERY,
  JOBS_QUERY,
  SAVE_JOB_MUTATION,
  UNSAVE_JOB_MUTATION,
} from "@/lib/graphql/operations"

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()

  const [saved, setSaved] = useState(false)
  const [savingJob, setSavingJob] = useState(false)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [user, setUser] = useState<{ id?: string; role?: string } | null>(null)

  const { data, loading, refetch } = useQuery(JOB_BY_SLUG_QUERY, {
    variables: { slug },
    skip: !slug,
  })

  const { data: otherJobsData } = useQuery(JOBS_QUERY, {
    variables: {
      first: 6,
      filter: { isActive: true },
      sort: { field: "CREATED_AT", order: "DESC" },
    },
  })

  const [incrementJobView] = useMutation(INCREMENT_JOB_VIEW_MUTATION)
  const [saveJob] = useMutation(SAVE_JOB_MUTATION)
  const [unsaveJob] = useMutation(UNSAVE_JOB_MUTATION)

  const job = data?.job
  const otherJobs =
    otherJobsData?.jobs?.edges
      ?.map((e: { node: { slug: string } }) => e.node)
      .filter((j: { slug: string }) => j.slug !== slug)
      .slice(0, 5) ?? []

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  useEffect(() => {
    if (!slug) return
    incrementJobView({ variables: { slug } })
      .then(() => refetch())
      .catch(console.error)
  }, [slug, incrementJobView, refetch])

  useEffect(() => {
    if (job?.isSaved !== undefined) {
      setSaved(job.isSaved)
    }
  }, [job?.isSaved])

  async function toggleSave() {
    if (!user?.id) {
      router.push("/login")
      return
    }
    if (user?.role !== "candidate" || !job?.id) return

    setSavingJob(true)
    try {
      if (saved) {
        await unsaveJob({ variables: { jobId: job.id } })
        setSaved(false)
      } else {
        await saveJob({ variables: { jobId: job.id } })
        setSaved(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSavingJob(false)
    }
  }

  const handleApply = () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}")
    if (!stored?.id) {
      router.push("/login")
      return
    }
    setShowApplyForm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-700">Job not found</p>
          <p className="text-sm text-gray-400 mt-1">
            This listing may have been removed.
          </p>
        </div>
      </div>
    )
  }

  const companyName = job.company?.name || job.companyName || "N/A"
  const postedDate = new Date(job.createdAt)
  const daysAgo = Math.floor(
    (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div
      className="min-h-screen bg-[#F4F2EE]"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Jobs
          </button>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-800 font-medium truncate">{job.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
                    {job.title}
                  </h1>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                      <Building2 size={14} />
                      {companyName}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {daysAgo === 0
                        ? "Posted today"
                        : daysAgo === 1
                        ? "Posted yesterday"
                        : `Posted ${daysAgo} days ago`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {user?.role === "candidate" && (
                    <button
                      onClick={toggleSave}
                      disabled={savingJob}
                      title={saved ? "Remove from saved" : "Save job"}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Bookmark
                        size={20}
                        className={saved ? "fill-blue-600 text-blue-600" : "text-gray-400"}
                      />
                    </button>
                  )}
                  <div className="w-14 h-14 rounded-md overflow-hidden shadow-sm bg-white border border-gray-100 flex items-center justify-center">
                    {job.company?.logoUrl ? (
                      <Image
                        src={job.company.logoUrl}
                        alt={job.company.name}
                        width={56}
                        height={56}
                        className="object-contain w-full h-full p-2"
                      />
                    ) : (
                      <Building2 size={22} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <Tag icon={<MapPin size={12} />} label={job.location} />
                <Tag icon={<Briefcase size={12} />} label={job.employmentType} />
                {job.experience && (
                  <Tag icon={<Clock size={12} />} label={job.experience} />
                )}
                {job.salaryRange && (
                  <Tag icon={<IndianRupee size={12} />} label={job.salaryRange} />
                )}
                <Tag
                  icon={<Eye size={12} />}
                  label={`${job.views} views`}
                  variant="muted"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Job Description</h2>

            <div
              className="prose max-w-none prose-sm text-gray-700
                         prose-h1:text-lg prose-h2:text-base
                         prose-h1:font-bold prose-h2:font-semibold
                         prose-ul:list-disc prose-ul:pl-5
                         prose-strong:text-gray-900
                         break-words overflow-hidden"
              dangerouslySetInnerHTML={{ __html: job.description }}
            />

            <div className="mt-8 pt-5 border-t border-gray-100">
              {job.isExternal ? (
                <div className="flex flex-wrap gap-3">
                  {job.applyUrl && (
                    <a
                      href={job.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-7 py-2.5 rounded-full"
                    >
                      Apply on Company Website
                    </a>
                  )}
                </div>
              ) : (
                user?.role === "candidate" && (
                  <>
                    <button
                      onClick={handleApply}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold px-7 py-2.5 rounded-full transition-all duration-150 shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
                    >
                      Apply for this position
                    </button>

                    {showApplyForm && (
                      <div className="mt-6 border-t pt-6">
                        <ApplySection jobId={job.id} />
                      </div>
                    )}
                  </>
                )
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
              Job Overview
            </h3>

            <div className="space-y-3.5">
              <OverviewRow label="Employment Type" value={job.employmentType} />
              {job.experience && (
                <OverviewRow label="Experience" value={job.experience} />
              )}
              {job.salaryRange && (
                <OverviewRow label="Salary Range" value={job.salaryRange} />
              )}
              <OverviewRow
                label="Posted On"
                value={postedDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              />
              <OverviewRow label="Location" value={job.location} />
            </div>
          </div>

          <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              About Company
            </h3>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-md overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                {job.company?.logoUrl ? (
                  <Image
                    src={job.company.logoUrl}
                    alt={job.company.name}
                    width={40}
                    height={40}
                    className="object-contain w-full h-full p-1"
                  />
                ) : (
                  <Building2 size={16} className="text-gray-400" />
                )}
              </div>
              <p className="text-sm font-semibold text-gray-800">{companyName}</p>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              More information about this company is not available at the moment.
            </p>
          </div>

          {otherJobs.length > 0 && (
            <div className="bg-white rounded-md shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                Similar Jobs
              </h3>

              <div className="space-y-1">
                {otherJobs.map((item: {
                  id: string
                  title: string
                  slug: string
                  location: string
                  company?: { name: string }
                  companyName?: string
                }) => (
                  <Link
                    key={item.id}
                    href={`/jobs/${item.slug}`}
                    className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Building2 size={12} className="text-gray-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.company?.name || item.companyName}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} />
                        {item.location}
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1"
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Tag({
  icon,
  label,
  variant = "default",
}: {
  icon: React.ReactNode
  label: string
  variant?: "default" | "muted"
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
        variant === "muted"
          ? "bg-gray-100 text-gray-400"
          : "bg-blue-50 text-blue-700"
      }`}
    >
      {icon}
      {label}
    </span>
  )
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-400 font-medium min-w-[90px]">{label}</span>
      <span className="text-xs text-gray-800 font-semibold text-right">{value}</span>
    </div>
  )
}
