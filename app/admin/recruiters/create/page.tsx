"use client"

import { useState } from "react"
import { useMutation } from "@/lib/apollo/hooks"
import { CREATE_RECRUITER_MUTATION } from "@/lib/graphql/operations"
import { getGraphQLErrorMessage } from "@/lib/auth/session"

export default function CreateRecruiter() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    companyId: "",
  })
  const [error, setError] = useState("")

  const [createRecruiter, { loading }] = useMutation(CREATE_RECRUITER_MUTATION)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      await createRecruiter({
        variables: { input: form },
      })
      alert("Recruiter created successfully")
    } catch (err) {
      setError(getGraphQLErrorMessage(err))
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Create Recruiter</h1>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input"
        />
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="input"
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input"
        />
        <input
          placeholder="Company ID (UUID)"
          value={form.companyId}
          onChange={(e) => setForm({ ...form, companyId: e.target.value })}
          className="input"
        />

        <button className="btn-primary" disabled={loading}>
          {loading ? "Creating..." : "Create Recruiter"}
        </button>
      </form>
    </div>
  )
}
