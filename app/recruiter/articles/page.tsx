"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import CreateArticleButton from "@/components/recruiter/CreateArticleButton"
import {
  fetchArticlePostingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits"
import {
  DELETE_RECRUITER_ARTICLE_MUTATION,
  MY_RECRUITER_ARTICLES_QUERY,
} from "@/lib/graphql/operations"

type Article = {
  id: string
  title: string
  slug: string
  excerpt?: string
  imageUrl?: string
  badge?: string
  status?: string
  createdAt: string
}

export default function RecruiterArticlesPage() {
  const [eligibility, setEligibility] = useState<ContentLimitEligibility | null>(null)

  const { data, loading, refetch } = useQuery(MY_RECRUITER_ARTICLES_QUERY)
  const [deleteArticle] = useMutation(DELETE_RECRUITER_ARTICLE_MUTATION)

  const articles: Article[] = data?.myRecruiterArticles ?? []

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setEligibility(await fetchArticlePostingEligibility(token))
      } catch (error) {
        console.error("Article eligibility error:", error)
      }
    }
    loadEligibility()
  }, [])

  async function handleDelete(id: string) {
    const ok = confirm("Are you sure you want to delete this article?")
    if (!ok) return

    try {
      await deleteArticle({ variables: { id } })
      await refetch()
    } catch {
      alert("Failed to delete article")
    }
  }

  if (loading) {
    return <p className="p-10">Loading articles...</p>
  }

  return (
    <div className="max-w-6xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Articles</h1>
          {eligibility && (
            <p className="text-sm text-gray-500 mt-1">
              {eligibility.isUnlimited
                ? "Unlimited technical articles on your plan"
                : eligibility.canCreate
                  ? `${eligibility.remaining ?? 0} article${eligibility.remaining === 1 ? "" : "s"} remaining this year`
                  : eligibility.message}
            </p>
          )}
        </div>

        <CreateArticleButton eligibility={eligibility} />
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-500">No articles created yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map(article => (
            <div
              key={article.id}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {article.imageUrl && (
                <div className="relative w-full h-40">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                </div>
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  {article.badge && (
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white">
                      {article.badge}
                    </span>
                  )}

                  {article.status && (
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        article.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {article.status}
                    </span>
                  )}
                </div>

                <h2 className="font-semibold text-lg line-clamp-2">
                  {article.title}
                </h2>

                {article.excerpt && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  Created:{" "}
                  {new Date(article.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-4 pt-3 border-t">
                  <Link
                    href={`/recruiter/articles/${article.id}/edit`}
                    className="text-blue-600 text-sm font-medium"
                  >
                    Edit
                  </Link>

                  <button
                    onClick={() => handleDelete(article.id)}
                    className="text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
