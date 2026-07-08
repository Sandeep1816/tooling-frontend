"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@/lib/apollo/hooks"
import {
  CREATE_COMPANY_MUTATION,
  UPDATE_USER_MUTATION,
} from "@/lib/graphql/operations"
import { getGraphQLErrorMessage } from "@/lib/auth/session"
import { getSessionUser } from "@/lib/auth/session"

export default function RecruiterOnboardingPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [headline, setHeadline] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [location, setLocation] = useState("")
  const [website, setWebsite] = useState("")
  const [error, setError] = useState("")

  const [createCompany, { loading: creatingCompany }] = useMutation(CREATE_COMPANY_MUTATION)
  const [updateUser, { loading: updatingUser }] = useMutation(UPDATE_USER_MUTATION)
  const loading = creatingCompany || updatingUser

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    if (!user || user.role !== "recruiter") {
      router.push("/login")
    }

    // If already onboarded, skip
    if (user?.isOnboarded && user?.companyId) {
      router.push("/recruiter/dashboard")
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      const user = getSessionUser()
      if (!user?.id) {
        router.push("/login")
        return
      }

      const { data } = await createCompany({
        variables: {
          input: {
            name: companyName,
            website: website || null,
            location: location || null,
          },
        },
      })

      const company = data?.createCompany
      if (!company?.id) {
        setError("Failed to create company")
        return
      }

      const { data: userData } = await updateUser({
        variables: {
          id: user.id,
          input: {
            fullName,
            headline: headline || undefined,
            companyId: company.id,
            isOnboarded: true,
          },
        },
      })

      if (!userData?.updateUser) {
        setError("Failed to update recruiter profile")
        return
      }

      const updatedUser = {
        ...user,
        companyId: company.id,
        isOnboarded: true,
        fullName: userData.updateUser.fullName || fullName,
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))

      router.push("/recruiter/dashboard")
    } catch (err) {
      setError(getGraphQLErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center px-4">
      <div className="bg-white max-w-xl w-full rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-2">
          Let’s set up your Company profile
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          This helps candidates trust you and your company
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            required
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <input
            placeholder="Your headline (e.g. Senior Recruiter)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <hr />

          <input
            required
            placeholder="Company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <input
            placeholder="Company website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <input
            placeholder="Company location "
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full h-12 px-4 border rounded"
          />

          <button
            disabled={loading}
            className="w-full h-12 bg-[#0073FF] text-white rounded font-medium disabled:opacity-60"
          >
            {loading ? "Setting up..." : "Finish setup"}
          </button>
        </form>
      </div>
    </div>
  )
}
