"use client"

import { useState } from "react"
import { getAdminBulkTemplateUrl, getAdminBulkUploadUrl } from "@/lib/graphql/server"

export default function BulkDirectoryUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      setResult(null)
      setError(null)

      const res = await fetch(getAdminBulkUploadUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      setError(null)

      const res = await fetch(getAdminBulkTemplateUrl(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error("Failed to download template")
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "bulk_supplier_template.xlsx"
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed")
    }
  }

  return (
    <div className="p-10 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">
        Bulk Supplier Directory Upload
      </h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <button
          onClick={handleDownloadTemplate}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Download Excel Template
        </button>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border p-2 rounded w-full"
        />

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-purple-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Excel"}
        </button>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-gray-50 p-4 rounded text-sm space-y-2">
            <p><strong>Total:</strong> {result.total}</p>
            <p className="text-green-600">
              <strong>Success:</strong> {result.successCount}
            </p>
            <p className="text-red-600">
              <strong>Failed:</strong> {result.failedCount}
            </p>

            {result.failed?.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold mb-2">Failed Rows:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {result.failed.map((item: { email: string; error: string }, index: number) => (
                    <li key={index}>
                      {item.email} — {item.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
