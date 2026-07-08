"use client"

import Link from "next/link"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import { Calendar, Eye, Users } from "lucide-react"
import {
  ADMIN_EVENTS_QUERY,
  PUBLISH_EVENT_MUTATION,
} from "@/lib/graphql/operations"
import { useState } from "react"

type Event = {
  id: string
  title: string
  slug: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  startDate: string
  endDate: string
  location?: string
  createdAt: string
  views: number
  registrationCount: number
}

export default function AdminEventsPage() {
  const { data, loading, refetch } = useQuery(ADMIN_EVENTS_QUERY)
  const [publishEvent] = useMutation(PUBLISH_EVENT_MUTATION)
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const events: Event[] = data?.adminEvents ?? []
  const totalEvents = events.length
  const totalViews = events.reduce((sum, e) => sum + (e.views ?? 0), 0)
  const totalRegistrations = events.reduce(
    (sum, e) => sum + (e.registrationCount ?? 0),
    0
  )

  const handlePublish = async (id: string) => {
    if (!confirm("Publish this event?")) return

    setPublishingId(id)
    try {
      await publishEvent({ variables: { id } })
      await refetch()
    } catch {
      alert("Failed to publish event")
    } finally {
      setPublishingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        <div className="w-12 h-12 border-4 border-[#0A2B57] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2B57]">Events Management</h1>
          <p className="text-sm text-gray-500">Create, review and publish events</p>
        </div>

        <Link
          href="/admin/events/create"
          className="bg-[#0A2B57] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#143D7A] transition"
        >
          + Create Event
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Events" value={totalEvents} icon={<Calendar />} color="bg-blue-600" />
        <StatCard label="Total Views" value={totalViews} icon={<Eye />} color="bg-green-600" />
        <StatCard label="Registrations" value={totalRegistrations} icon={<Users />} color="bg-purple-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {events.length === 0 ? (
          <p className="p-6 text-gray-500">No events found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4 text-center">Dates</th>
                <th className="px-6 py-4 text-center">Location</th>
                <th className="px-6 py-4 text-center">Views</th>
                <th className="px-6 py-4 text-center">Registrations</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-[#0A2B57]">
                    <Link
                      href={`/admin/events/${event.id}/registrations`}
                      className="hover:underline text-blue-600"
                    >
                      {event.title}
                    </Link>
                  </td>

                  <td className="px-6 py-4 text-center text-gray-600">
                    {new Date(event.startDate).toLocaleDateString()} –{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 text-center text-gray-600">
                    {event.location || "—"}
                  </td>

                  <td className="px-6 py-4 text-center font-semibold">{event.views}</td>

                  <td className="px-6 py-4 text-center font-semibold">
                    {event.registrationCount ?? 0}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2">
                    {event.status === "DRAFT" && (
                      <button
                        onClick={() => handlePublish(event.id)}
                        disabled={publishingId === event.id}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {publishingId === event.id ? "Publishing..." : "Publish"}
                      </button>
                    )}

                    <Link
                      href={`/admin/events/edit/${event.id}`}
                      className="bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div
        className={`w-12 h-12 ${color} text-white rounded-lg flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  )
}
