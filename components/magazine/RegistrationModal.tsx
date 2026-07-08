"use client"

import { useState } from "react"
import { useMutation } from "@/lib/apollo/hooks"
import { REGISTER_FOR_MAGAZINE_MUTATION } from "@/lib/graphql/operations"

export default function RegistrationModal({
  magazineId,
  onClose,
}: {
  magazineId: string
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [registerForMagazine] = useMutation(REGISTER_FOR_MAGAZINE_MUTATION)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = Object.fromEntries(new FormData(e.currentTarget))

    try {
      await registerForMagazine({
        variables: {
          input: {
            magazineId,
            firstName: String(formData.firstName),
            lastName: String(formData.lastName),
            email: String(formData.email),
            companyName: formData.companyName ? String(formData.companyName) : undefined,
            jobTitle: formData.jobTitle ? String(formData.jobTitle) : undefined,
            country: formData.country ? String(formData.country) : undefined,
          },
        },
      })
      alert("Check your email for the magazine.")
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Access Digital Edition</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="firstName" required placeholder="First Name" className="input w-full" />
          <input name="lastName" required placeholder="Last Name" className="input w-full" />
          <input name="email" required type="email" placeholder="Email" className="input w-full" />
          <input name="companyName" placeholder="Company" className="input w-full" />
          <input name="jobTitle" placeholder="Job Title" className="input w-full" />
          <input name="country" placeholder="Country" className="input w-full" />

          <button
            disabled={loading}
            className="bg-black text-white w-full py-2 rounded"
          >
            {loading ? "Submitting..." : "Get Magazine"}
          </button>
        </form>

        <button onClick={onClose} className="text-sm text-gray-500 mt-4">
          Cancel
        </button>
      </div>
    </div>
  )
}
