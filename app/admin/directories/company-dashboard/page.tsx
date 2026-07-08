"use client"

import Link from "next/link"
import { useQuery } from "@/lib/apollo/hooks"
import SectionCard from "@/app/admin/components/SectionCard"
import CompanyTable from "@/app/admin/components/CompanyTable"
import RecruiterTable from "@/app/admin/components/RecruiterTable"
import DirectoryTable from "@/app/admin/components/DirectoryTable"
import StatCard from "@/app/admin/components/StatCard"
import {
  ADMIN_SUPPLIER_DIRECTORIES_QUERY,
  COMPANIES_QUERY,
  USERS_QUERY,
} from "@/lib/graphql/operations"
import type { Company, Directory, Recruiter } from "@/types/admin"

export default function CompanyDashboard() {
  const { data: companiesData, loading: companiesLoading } = useQuery(COMPANIES_QUERY, {
    variables: { first: 500, sort: { field: "CREATED_AT", order: "DESC" } },
    fetchPolicy: "network-only",
  })

  const { data: usersData, loading: usersLoading } = useQuery(USERS_QUERY, {
    variables: {
      first: 500,
      filter: { role: "RECRUITER" },
      sort: { field: "CREATED_AT", order: "DESC" },
    },
    fetchPolicy: "network-only",
  })

  const { data: directoriesData, loading: directoriesLoading } = useQuery(
    ADMIN_SUPPLIER_DIRECTORIES_QUERY,
    { fetchPolicy: "network-only" }
  )

  const loading = companiesLoading || usersLoading || directoriesLoading

  const companies: Company[] =
    companiesData?.companies?.edges?.map(
      (e: {
        node: {
          id: string
          name: string
          slug: string
          isVerified: boolean
          createdAt: string
        }
      }) => e.node
    ) ?? []

  const recruiters: Recruiter[] =
    usersData?.users?.edges?.map(
      (e: {
        node: {
          id: string
          username: string
          email: string
          createdAt: string
          companyId?: string | null
        }
      }) => {
        const company = companies.find((c) => c.id === e.node.companyId)
        return {
          id: e.node.id,
          username: e.node.username ?? "",
          email: e.node.email,
          createdAt: e.node.createdAt,
          company: company ? { name: company.name } : undefined,
        }
      }
    ) ?? []

  const directories: Directory[] =
    directoriesData?.adminSupplierDirectories?.map(
      (d: {
        id: string
        name: string
        slug: string
        status: Directory["status"]
        createdAt: string
        company?: { name: string }
        submittedBy?: { username: string }
      }) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        status: d.status,
        createdAt: d.createdAt,
        company: d.company,
        submittedBy: d.submittedBy,
      })
    ) ?? []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fc]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Company Management Overview</h1>
          <p className="text-sm text-gray-500">
            Manage companies, recruiters and directories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Companies" value={companies.length} />
          <StatCard label="Total Recruiters" value={recruiters.length} />
          <StatCard label="Total Directories" value={directories.length} />
        </div>

        <div className="flex gap-4">
          <Link
            href="/admin/companies/create"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:opacity-90"
          >
            + Create Company
          </Link>

          <Link
            href="/admin/recruiters/create"
            className="bg-green-600 text-white px-4 py-2 rounded hover:opacity-90"
          >
            + Link to Company
          </Link>

          <Link
            href="/admin/directories/create"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:opacity-90"
          >
            + Create Directory
          </Link>
        </div>

        <SectionCard title="Companies">
          <CompanyTable companies={companies} />
        </SectionCard>

        <SectionCard title="Recruiters">
          <RecruiterTable recruiters={recruiters} />
        </SectionCard>

        <SectionCard title="Directories">
          <DirectoryTable directories={directories} />
        </SectionCard>
      </div>
    </div>
  )
}
