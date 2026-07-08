"use client"
import Image from "next/image"
import { useState } from "react"
import UploadBox from "@/components/UploadBox"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import { getUploadUrl } from "@/lib/graphql/server"
import {
  CREATE_COVER_STORY_MUTATION,
  MAGAZINE_CREATION_DATA_QUERY,
} from "@/lib/graphql/operations"

function generateSlug(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
}

export default function CreateCoverStoryPage() {
  const router = useRouter()
  const { data } = useQuery(MAGAZINE_CREATION_DATA_QUERY)
  const [createCoverStory] = useMutation(CREATE_COVER_STORY_MUTATION)

  const authors = data?.magazineCreationData?.authors ?? []
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    badge: "",
    imageBrief: "",
    coverImageUrl: "",
    slugImageUrls: [] as string[],
    authorId: "",
  })

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

  async function uploadExtraImage(file: File) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(getUploadUrl(), { method: "POST", body: data })
    const result = await res.json()

    setForm((prev) => ({
      ...prev,
      slugImageUrls: [...prev.slugImageUrls, result.imageUrl],
    }))
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      slugImageUrls: prev.slugImageUrls.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit() {
    setLoading(true)

    try {
      await createCoverStory({
        variables: {
          input: {
            title: form.title,
            slug: form.slug,
            shortDescription: form.shortDescription || undefined,
            fullDescription: form.fullDescription,
            badge: form.badge || undefined,
            imageBrief: form.imageBrief || undefined,
            coverImageUrl: form.coverImageUrl || undefined,
            slugImageUrls: form.slugImageUrls.length > 0 ? form.slugImageUrls : undefined,
            authorId: form.authorId || undefined,
          },
        },
      })

      router.push("/admin/magazines")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create cover story")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-8">
      <h1 className="text-3xl font-bold">Create Cover Story</h1>

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
        placeholder="Short Description"
        className="w-full border p-3 rounded"
        value={form.shortDescription}
        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
      />

      <textarea
        placeholder="Full Description"
        rows={6}
        className="w-full border p-3 rounded"
        value={form.fullDescription}
        onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
      />

      <input
        placeholder="Badge"
        className="w-full border p-3 rounded"
        value={form.badge}
        onChange={(e) => setForm({ ...form, badge: e.target.value })}
      />

      <UploadBox
        label="Cover Image"
        value={form.coverImageUrl}
        onUpload={(file) => uploadImage(file, "coverImageUrl")}
      />

      <UploadBox label="Additional Images" multiple onUpload={uploadExtraImage} />

      {form.slugImageUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {form.slugImageUrls.map((img, index) => (
            <div key={index} className="relative">
              <div className="relative w-full h-32">
                <Image
                  src={img}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover rounded border"
                  sizes="(max-width: 768px) 100vw, 200px"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

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

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-6 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Cover Story"}
      </button>
    </div>
  )
}
