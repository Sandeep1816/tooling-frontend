"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import { Building2, Eye, Share2 } from "lucide-react"
import AdminPagination, { ADMIN_PAGE_SIZE } from "@/components/admin/AdminPagination"
import {
  ADMIN_SUPPLIER_DIRECTORIES_QUERY,
  APPROVE_SUPPLIER_DIRECTORY_MUTATION,
} from "@/lib/graphql/operations"

const PAGE_SIZE = ADMIN_PAGE_SIZE

type Directory = {
  id: string
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  isLiveEditable: boolean
  views?: number
  connections?: number
  company?: { name: string }
  submittedBy?: { email: string }
  createdAt: string
}

export default function AdminDirectoriesPage() {
  const { data, loading, refetch } = useQuery(ADMIN_SUPPLIER_DIRECTORIES_QUERY)
  const [publishDirectory] = useMutation(APPROVE_SUPPLIER_DIRECTORY_MUTATION)
  const [currentPage, setCurrentPage] = useState(1)

  const directories: Directory[] = data?.adminSupplierDirectories ?? []

  const totalDirectories = directories.length
  const totalViews = directories.reduce((sum, d) => sum + (d.views ?? 0), 0)
  const totalConnections = directories.reduce(
    (sum, d) => sum + (d.connections ?? 0),
    0
  )

  const totalPages = Math.max(1, Math.ceil(directories.length / PAGE_SIZE))

  const paginatedDirectories = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return directories.slice(start, start + PAGE_SIZE)
  }, [directories, currentPage])

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const publishEvent = async (id: string) => {
    if (!confirm("Publish this directory?")) return
    try {
      await publishDirectory({ variables: { id } })
      refetch()
    } catch {
      alert("Failed to approve directory")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
        <div className="w-12 h-12 border-4 border-[#0A2B57] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2B57]">Supplier Directories</h1>
          <p className="text-sm text-gray-500">Review and manage supplier listings</p>
        </div>
        <Link
          href="/admin/directories/create"
          className="bg-[#0A2B57] text-white px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#143D7A] transition"
        >
          + Create Directory
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Directories" value={totalDirectories} icon={<Building2 />} color="bg-blue-600" />
        <StatCard label="Total Views" value={totalViews} icon={<Eye />} color="bg-green-600" />
        <StatCard label="Connections" value={totalConnections} icon={<Share2 />} color="bg-purple-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {directories.length === 0 ? (
          <p className="p-6 text-gray-500">No directories found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-gray-600">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4 text-center">Views</th>
                <th className="px-6 py-4 text-center">Connections</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedDirectories.map((directory) => (
                <tr key={directory.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-[#0A2B57]">
                    <Link
                      href={`/admin/directories/${directory.id}`}
                      className="hover:underline text-blue-600"
                    >
                      {directory.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {directory.company?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {directory.views ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center font-semibold">
                    {directory.connections ?? 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        directory.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : directory.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {directory.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {directory.status === "PENDING" && (
                      <button
                        onClick={() => publishEvent(directory.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    <Link
                      href={`/admin/directories/${directory.id}`}
                      className="bg-gray-100 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-200"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalDirectories}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
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
      <div className={`w-12 h-12 ${color} text-white rounded-lg flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  )
}
