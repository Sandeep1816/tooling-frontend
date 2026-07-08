"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useMutation } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import {
  fetchArticlePostingEligibility,
  type ContentLimitEligibility,
} from "@/lib/packageLimits"
import { getUploadUrl } from "@/lib/graphql/server"
import { CREATE_RECRUITER_ARTICLE_MUTATION } from "@/lib/graphql/operations"

export default function CreateRecruiterArticlePage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [badge, setBadge] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [eligibility, setEligibility] = useState<ContentLimitEligibility | null>(null)

  const [createArticle, { loading }] = useMutation(CREATE_RECRUITER_ARTICLE_MUTATION)

  useEffect(() => {
    async function loadEligibility() {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        setEligibility(await fetchArticlePostingEligibility(token))
      } catch (err) {
        console.error(err)
      }
    }
    loadEligibility()
  }, [])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("image", file)

      const res = await fetch(getUploadUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (!res.ok) throw new Error("Image upload failed")

      const data = await res.json()
      setImageUrl(data.imageUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await createArticle({
        variables: {
          input: {
            title,
            excerpt: excerpt || null,
            content,
            imageUrl: imageUrl || null,
            badge: badge.trim() || null,
          },
        },
      })

      router.push("/recruiter/articles")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create article")
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Create Article</h1>

      {eligibility && !eligibility.canCreate && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>{eligibility.message}</p>
          <Link href="/packages" className="mt-2 inline-block font-medium text-[#004d73] hover:underline">
            View packages →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="text"
          placeholder="Article title"
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Short excerpt"
          className="w-full border p-2 rounded"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <textarea
          placeholder="Article content"
          className="w-full border p-2 rounded h-48"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Badge (optional) e.g. FEATURED, TRENDING"
          className="w-full border p-2 rounded"
          value={badge}
          onChange={(e) => setBadge(e.target.value.toUpperCase())}
        />

        <UploadBox
          label="Article Image"
          value={imageUrl}
          height="h-52"
          accept="image/*"
          onUpload={handleImageUpload}
        />

        {uploading && (
          <p className="text-sm text-gray-500 mt-2">
            Uploading image...
          </p>
        )}

        <button
          type="submit"
          disabled={loading || uploading || eligibility?.canCreate === false}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish Article"}
        </button>
      </form>
    </div>
  )
}
