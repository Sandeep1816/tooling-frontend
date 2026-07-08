"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@/lib/apollo/hooks"
import { CREATE_COMPANY_MUTATION } from "@/lib/graphql/operations"
import { getGraphQLErrorMessage } from "@/lib/auth/session"

export default function CreateCompany() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: "",
    website: "",
    description: "",
    location: "",
  })
  const [error, setError] = useState("")

  const [createCompany, { loading }] = useMutation(CREATE_COMPANY_MUTATION)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      await createCompany({
        variables: {
          input: {
            name: form.name,
            website: form.website || null,
            description: form.description || null,
            location: form.location || null,
          },
        },
      })
      router.push("/admin/companies")
    } catch (err) {
      setError(getGraphQLErrorMessage(err))
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Company</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Company Name"
          className="input"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Website"
          className="input"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
        <input
          placeholder="Location"
          className="input"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  )
}
