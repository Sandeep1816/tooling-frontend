"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import { getUploadUrl, getUploadResumeUrl } from "@/lib/graphql/server"
import {
  CREATE_MAGAZINE_MUTATION,
  MAGAZINE_CREATION_DATA_QUERY,
} from "@/lib/graphql/operations"

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function CreateMagazinePage() {
  const router = useRouter()
  const { data } = useQuery(MAGAZINE_CREATION_DATA_QUERY)
  const [createMagazine] = useMutation(CREATE_MAGAZINE_MUTATION)

  const authors = data?.magazineCreationData?.authors ?? []
  const coverStories = data?.magazineCreationData?.coverStories ?? []

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    coverImageUrl: "",
    pdfUrl: "",
    flipbookPages: [] as string[],
    authorId: "",
    coverStoryId: "",
  })

  const [loading, setLoading] = useState(false)

  async function uploadImage(file: File, field: string) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(getUploadUrl(), { method: "POST", body: data })
    const result = await res.json()

    setForm((prev) => ({
      ...prev,
      [field]: result.imageUrl,
    }))
  }

  async function uploadPdf(file: File) {
    const data = new FormData()
    data.append("resume", file)

    const res = await fetch(getUploadResumeUrl(), { method: "POST", body: data })
    const result = await res.json()

    setForm((prev) => ({
      ...prev,
      pdfUrl: result.resumeUrl,
    }))
  }

  async function uploadFlipbookPage(file: File) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(getUploadUrl(), { method: "POST", body: data })
    const result = await res.json()

    setForm((prev) => ({
      ...prev,
      flipbookPages: [...(prev.flipbookPages || []), result.imageUrl],
    }))
  }

  function removePage(index: number) {
    setForm((prev) => ({
      ...prev,
      flipbookPages: prev.flipbookPages.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(status: "DRAFT" | "PUBLISHED") {
    setLoading(true)

    try {
      await createMagazine({
        variables: {
          input: {
            title: form.title,
            slug: form.slug,
            description: form.description || undefined,
            coverImageUrl: form.coverImageUrl || undefined,
            pdfUrl: form.pdfUrl,
            flipbookPages: form.flipbookPages.length > 0 ? form.flipbookPages : undefined,
            authorId: form.authorId || undefined,
            coverStoryId: form.coverStoryId || undefined,
            status,
          },
        },
      })

      router.push("/admin/magazines")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create magazine")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-8">
      <h1 className="text-3xl font-bold">Create Magazine</h1>

      <input
        placeholder="Title"
        className="w-full border p-3 rounded"
        value={form.title}
        onChange={(e) => {
          const title = e.target.value
          setForm({
            ...form,
            title,
            slug: generateSlug(title),
          })
        }}
      />

      <input
        placeholder="Slug"
        className="w-full border p-3 rounded"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
      />

      <textarea
        placeholder="Description"
        className="w-full border p-3 rounded"
        rows={4}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <select
        className="w-full border p-3 rounded"
        value={form.authorId}
        onChange={(e) => setForm({ ...form, authorId: e.target.value })}
      >
        <option value="">Select Author</option>
        {authors.map((a: { id: string; name: string }) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <select
        className="w-full border p-3 rounded"
        value={form.coverStoryId}
        onChange={(e) => setForm({ ...form, coverStoryId: e.target.value })}
      >
        <option value="">Select Cover Story</option>
        {coverStories.map((cs: { id: string; title: string }) => (
          <option key={cs.id} value={cs.id}>
            {cs.title}
          </option>
        ))}
      </select>

      <UploadBox
        label="Cover Image"
        value={form.coverImageUrl}
        height="h-52"
        accept="image/*"
        onUpload={(file) => uploadImage(file, "coverImageUrl")}
      />

      <UploadBox
        label="Magazine PDF"
        value={form.pdfUrl}
        height="h-40"
        accept="application/pdf"
        onUpload={uploadPdf}
      />

      <UploadBox
        label="Flipbook Pages"
        multiple
        accept="image/*"
        height="h-32"
        onUpload={uploadFlipbookPage}
      />

      {form.flipbookPages?.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {form.flipbookPages.map((img: string, index: number) => (
            <div key={index} className="relative">
              <img
                src={img}
                alt={`Page ${index + 1}`}
                className="w-full h-32 object-cover rounded border"
              />
              <button
                onClick={() => removePage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => handleSubmit("DRAFT")}
          className="bg-gray-600 text-white px-6 py-2 rounded"
        >
          Save Draft
        </button>

        <button
          onClick={() => handleSubmit("PUBLISHED")}
          className="bg-black text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </div>
  )
}
