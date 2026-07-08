"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import { getUploadUrl } from "@/lib/graphql/server"
import {
  POST_BY_ID_QUERY,
  UPDATE_RECRUITER_ARTICLE_MUTATION,
} from "@/lib/graphql/operations"

export default function EditRecruiterArticlePage() {
  const { id } = useParams()
  const router = useRouter()
  const articleId = String(id)

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [badge, setBadge] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [initialized, setInitialized] = useState(false)

  const { data, loading } = useQuery(POST_BY_ID_QUERY, {
    variables: { id: articleId },
    skip: !articleId,
  })

  useEffect(() => {
    if (initialized || !data?.postById) return
    const article = data.postById
    setTitle(article.title || "")
    setExcerpt(article.excerpt || "")
    setContent(article.content || "")
    setImageUrl(article.imageUrl || "")
    setBadge(article.badge || "")
    setInitialized(true)
  }, [data, initialized])

  const [updateArticle, { loading: saving }] = useMutation(UPDATE_RECRUITER_ARTICLE_MUTATION)

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
      await updateArticle({
        variables: {
          id: articleId,
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
      setError(err instanceof Error ? err.message : "Update failed")
    }
  }

  if (loading) return <p className="p-10">Loading article...</p>

  return (
    <div className="max-w-3xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Article</h1>

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
          disabled={saving || uploading}
          className="bg-black text-white px-6 py-2 rounded"
        >
          {saving ? "Updating..." : "Update Article"}
        </button>
      </form>
    </div>
  )
}
