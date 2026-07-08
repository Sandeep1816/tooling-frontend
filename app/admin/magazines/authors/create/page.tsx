"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@/lib/apollo/hooks"
import UploadBox from "@/components/UploadBox"
import { getUploadUrl } from "@/lib/graphql/server"
import { CREATE_MAGAZINE_AUTHOR_MUTATION } from "@/lib/graphql/operations"

export default function CreateAuthorPage() {
  const router = useRouter()
  const [createAuthor] = useMutation(CREATE_MAGAZINE_AUTHOR_MUTATION)

  const [form, setForm] = useState({
    name: "",
    profileImageUrl: "",
    designation: "",
    linkedinUrl: "",
  })

  async function handleSubmit() {
    try {
      await createAuthor({
        variables: {
          input: {
            name: form.name,
            profileImageUrl: form.profileImageUrl || undefined,
            designation: form.designation || undefined,
            linkedinUrl: form.linkedinUrl || undefined,
          },
        },
      })
      router.push("/admin/magazines")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create author")
    }
  }

  async function uploadFile(file: File) {
    const data = new FormData()
    data.append("image", file)

    const res = await fetch(getUploadUrl(), { method: "POST", body: data })
    const result = await res.json()

    setForm((prev) => ({
      ...prev,
      profileImageUrl: result.imageUrl,
    }))
  }

  return (
    <div className="max-w-3xl mx-auto p-10 space-y-6">
      <h1 className="text-2xl font-bold">Create Author</h1>

      <input
        placeholder="Author Name"
        className="w-full border p-3 rounded"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <UploadBox
        label="Profile Image"
        value={form.profileImageUrl}
        onUpload={uploadFile}
      />

      <input
        placeholder="Designation"
        className="w-full border p-3 rounded"
        value={form.designation}
        onChange={(e) => setForm({ ...form, designation: e.target.value })}
      />

      <input
        placeholder="LinkedIn URL"
        className="w-full border p-3 rounded"
        value={form.linkedinUrl}
        onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
      />

      <button onClick={handleSubmit} className="bg-black text-white px-6 py-2 rounded">
        Create Author
      </button>
    </div>
  )
}
