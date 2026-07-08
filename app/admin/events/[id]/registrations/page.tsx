"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@/lib/apollo/hooks"
import { EVENT_REGISTRATIONS_QUERY } from "@/lib/graphql/operations"

type Registration = {
  id: string
  fullName: string
  email: string
  phone: string
  companyName?: string
  jobTitle?: string
  country?: string
  createdAt: string
}

export default function EventRegistrationsPage() {
  const { id } = useParams<{ id: string }>()

  const { data, loading } = useQuery(EVENT_REGISTRATIONS_QUERY, {
    variables: { eventId: id },
    skip: !id,
  })

  const registrations: Registration[] = data?.eventRegistrations ?? []

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 bg-[#F4F6FA] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Event Registrations</h1>

      {registrations.length === 0 ? (
        <p>No registrations yet.</p>
      ) : (
        <table className="w-full bg-white rounded-xl shadow border text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Job Title</th>
              <th className="px-4 py-3 text-left">Country</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {registrations.map((reg) => (
              <tr key={reg.id}>
                <td className="px-4 py-3">{reg.fullName}</td>
                <td className="px-4 py-3">{reg.email}</td>
                <td className="px-4 py-3">{reg.phone}</td>
                <td className="px-4 py-3">{reg.companyName || "—"}</td>
                <td className="px-4 py-3">{reg.jobTitle || "—"}</td>
                <td className="px-4 py-3">{reg.country || "—"}</td>
                <td className="px-4 py-3">
                  {new Date(reg.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
