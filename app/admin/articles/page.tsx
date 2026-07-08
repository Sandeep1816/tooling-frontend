"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import { FileText, Eye, Share2, Check, X } from "lucide-react"
import {
  ADMIN_ARTICLES_QUERY,
  APPROVE_ARTICLE_MUTATION,
  REJECT_ARTICLE_MUTATION,
} from "@/lib/graphql/operations"

type Company = {
  id: string
  name: string
}

type Article = {
  id: string
  title: string
  views: number
  shares: number
  company?: Company
}

export default function AdminArticlesPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [status, setStatus] = useState<"PENDING" | "APPROVED">("APPROVED")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const { data, loading, refetch } = useQuery(ADMIN_ARTICLES_QUERY, {
    variables: { status },
  })

  const [approveArticle] = useMutation(APPROVE_ARTICLE_MUTATION)
  const [rejectArticle] = useMutation(REJECT_ARTICLE_MUTATION)

  const articles: Article[] = data?.adminArticles ?? []

  const handleApprove = async (id: string) => {
    try {
      setLoadingId(id)
      await approveArticle({ variables: { id } })
      await refetch()
      setSelectedCompanyId(null)
    } catch (error) {
      console.error("Approval failed", error)
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    try {
      setLoadingId(id)
      await rejectArticle({ variables: { id } })
      await refetch()
      setSelectedCompanyId(null)
    } catch (error) {
      console.error("Reject failed", error)
    } finally {
      setLoadingId(null)
    }
  }

  const totalArticles = articles.length

  const totalViews = useMemo(
    () => articles.reduce((sum, a) => sum + (a.views ?? 0), 0),
    [articles]
  )

  const totalShares = useMemo(
    () => articles.reduce((sum, a) => sum + (a.shares ?? 0), 0),
    [articles]
  )

  const companies = useMemo(() => {
    const map = new Map<string, { company: Company; count: number }>()

    articles.forEach(article => {
      if (!article.company) return

      if (!map.has(article.company.id)) {
        map.set(article.company.id, {
          company: article.company,
          count: 1,
        })
      } else {
        map.get(article.company.id)!.count++
      }
    })

    return Array.from(map.values())
  }, [articles])

  const filteredArticles = useMemo(() => {
    if (!selectedCompanyId) return []
    return articles.filter(a => a.company?.id === selectedCompanyId)
  }, [articles, selectedCompanyId])

  return (
    <div className="min-h-screen bg-[#F4F6FA] p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#0A2B57]">
          Article Moderation
        </h1>
        <p className="text-sm text-gray-500">
          Review and manage company articles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Articles Posted" value={totalArticles} icon={<FileText />} color="bg-blue-600" />
        <StatCard label="Articles Viewed" value={totalViews} icon={<Eye />} color="bg-green-600" />
        <StatCard label="Articles Shared" value={totalShares} icon={<Share2 />} color="bg-purple-600" />
      </div>

      <div className="flex gap-3">
        {(["PENDING", "APPROVED"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setStatus(tab)
              setSelectedCompanyId(null)
            }}
            className={`px-5 py-2 rounded-md text-sm font-medium transition
              ${
                status === tab
                  ? "bg-[#0A2B57] text-white shadow"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-[#0A2B57] mb-4">Companies</h2>
          <ul className="space-y-2">
            {companies.map(({ company, count }) => (
              <li
                key={company.id}
                onClick={() => setSelectedCompanyId(company.id)}
                className={`p-3 rounded-md cursor-pointer flex justify-between items-center transition
                  ${
                    selectedCompanyId === company.id
                      ? "bg-blue-50 text-[#0A2B57] font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <span>{company.name}</span>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{count}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="col-span-9 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {loading && <p className="text-gray-500">Loading articles...</p>}

          {!selectedCompanyId && !loading && (
            <p className="text-gray-500">Select a company to view articles</p>
          )}

          <ul className="space-y-4">
            {filteredArticles.map(article => (
              <li
                key={article.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-[#0A2B57]">{article.title}</h3>

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>👁 {article.views} views</p>
                    <p>🔁 {article.shares} shares</p>
                  </div>

                  {status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(article.id)}
                        disabled={loadingId === article.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        <Check size={14} />
                        {loadingId === article.id ? "..." : "Approve"}
                      </button>

                      <button
                        onClick={() => handleReject(article.id)}
                        disabled={loadingId === article.id}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className={`w-12 h-12 ${color} text-white rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  )
}
