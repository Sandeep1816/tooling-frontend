"use client"

import { resolveMediaUrl } from "@/lib/media";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useMutation, useQuery } from "@/lib/apollo/hooks"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  FolderOpen,
  User,
  Eye,
} from "lucide-react"
import AdminPagination, { ADMIN_PAGE_SIZE } from "@/components/admin/AdminPagination"
import { DELETE_POST_MUTATION, POSTS_QUERY } from "@/lib/graphql/operations"
import { getGraphQLErrorMessage } from "@/lib/auth/session"

/* ================= TYPES ================= */

type Post = {
  id: string
  title: string
  slug: string
  imageUrl?: string
  category?: { name: string }
  author?: { name: string }
  publishedAt?: string
  views: number
}

const PAGE_SIZE = ADMIN_PAGE_SIZE

/* ================= PAGE ================= */

export default function PostsList() {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const { data, loading, refetch } = useQuery(POSTS_QUERY, {
    variables: {
      first: PAGE_SIZE,
      page,
      filter: debouncedSearch ? { search: debouncedSearch } : undefined,
      sort: { field: "PUBLISHED_AT", order: "DESC" },
    },
    fetchPolicy: "network-only",
  })

  const [deletePost] = useMutation(DELETE_POST_MUTATION)

  const posts: Post[] = data?.posts?.edges?.map((e: { node: Post }) => e.node) ?? []
  const total = data?.posts?.totalCount ?? 0

  /* ================= DEBOUNCE ================= */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  /* ================= DELETE ================= */

  async function handleDelete(id: string) {
    const token = localStorage.getItem("token")
    if (!token) return alert("Unauthorized")

    if (!confirm("Delete this post?")) return

    try {
      await deletePost({ variables: { id } })
      await refetch()
    } catch (err) {
      alert(getGraphQLErrorMessage(err))
    }
  }

  /* ================= TABLE ================= */

  const columnHelper = createColumnHelper<Post>()

  const columns = [
    columnHelper.display({
      id: "image",
      header: "Image",
      cell: (info) => {
        const url = info.row.original.imageUrl
        return url ? (
          <Image
            src={resolveMediaUrl(url)}
            width={64}
            height={64}
            alt=""
            className="rounded object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            <FileText className="text-gray-400" />
          </div>
        )
      },
    }),

    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <div className="max-w-xs truncate font-medium">{info.getValue()}</div>
      ),
    }),

    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <FolderOpen size={14} />
          {info.getValue()?.name ?? "—"}
        </span>
      ),
    }),

    columnHelper.accessor("author", {
      header: "Author",
      cell: (info) => (
        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
          <User size={14} />
          {info.getValue()?.name ?? "—"}
        </span>
      ),
    }),

    columnHelper.accessor("views", {
      header: "Views",
      cell: (info) => (
        <span className="inline-flex items-center gap-1 text-sm">
          <Eye size={14} />
          {info.getValue()}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/posts/edit/${info.row.original.id}`)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <button
          onClick={() => router.push("/admin/posts/create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          New Post
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  )
}
