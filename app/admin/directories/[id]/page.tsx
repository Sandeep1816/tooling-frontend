"use client"

import { useParams, useRouter } from "next/navigation"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import {
  APPROVE_SUPPLIER_DIRECTORY_MUTATION,
  REJECT_SUPPLIER_DIRECTORY_MUTATION,
  SUPPLIER_BY_ID_QUERY,
} from "@/lib/graphql/operations"

export default function ReviewDirectoryPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data, loading } = useQuery(SUPPLIER_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  })

  const [approveDirectory] = useMutation(APPROVE_SUPPLIER_DIRECTORY_MUTATION)
  const [rejectDirectory] = useMutation(REJECT_SUPPLIER_DIRECTORY_MUTATION)

  const directory = data?.supplierById

  async function approve() {
    try {
      await approveDirectory({ variables: { id } })
      alert("Directory approved")
      router.push("/admin/directories")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Approval failed")
    }
  }

  async function reject() {
    try {
      await rejectDirectory({ variables: { id } })
      alert("Directory rejected")
      router.push("/admin/directories")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Rejection failed")
    }
  }

  if (loading) return <div className="p-10">Loading...</div>
  if (!directory) return <div className="p-10">Not found</div>

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-4">Review Supplier Directory</h1>

      <div className="bg-white rounded shadow p-6 space-y-4">
        <div>
          <strong>Company:</strong> {directory.name}
        </div>
        <div>
          <strong>Slug:</strong> {directory.slug}
        </div>
        <div>
          <strong>Submitted by:</strong>{" "}
          {directory.submittedBy?.fullName || directory.submittedBy?.email || "—"}
        </div>
        <div>
          <strong>Description:</strong>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
            {directory.description}
          </p>
        </div>
        {directory.website && (
          <div>
            <strong>Website:</strong>{" "}
            <a
              href={directory.website}
              target="_blank"
              className="text-blue-600 underline"
            >
              {directory.website}
            </a>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <button onClick={approve} className="bg-green-600 text-white px-6 py-2 rounded">
          Approve
        </button>
        <button onClick={reject} className="bg-red-600 text-white px-6 py-2 rounded">
          Reject
        </button>
        <button onClick={() => router.back()} className="border px-6 py-2 rounded">
          Cancel
        </button>
      </div>
    </div>
  )
}
