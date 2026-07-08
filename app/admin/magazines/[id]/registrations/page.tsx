"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@/lib/apollo/hooks"
import { MAGAZINE_REGISTRATIONS_QUERY } from "@/lib/graphql/operations"

export default function RegistrationsPage() {
  const { id } = useParams<{ id: string }>()

  const { data, loading } = useQuery(MAGAZINE_REGISTRATIONS_QUERY, {
    variables: { magazineId: id },
    skip: !id,
  })

  const registrations = data?.magazineRegistrations ?? []

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-6">Magazine Registrations</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Country</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r: {
            id: string
            firstName: string
            lastName: string
            email: string
            companyName?: string
            country?: string
          }) => (
            <tr key={r.id}>
              <td className="p-2 border">
                {r.firstName} {r.lastName}
              </td>
              <td className="p-2 border">{r.email}</td>
              <td className="p-2 border">{r.companyName}</td>
              <td className="p-2 border">{r.country}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
