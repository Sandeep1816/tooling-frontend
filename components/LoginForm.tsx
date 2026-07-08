"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { useMutation } from "@/lib/apollo/hooks"
import { LOGIN_MUTATION } from "@/lib/graphql/operations"
import { getGraphQLErrorMessage, saveAuthSession } from "@/lib/auth/session"

export default function LoginForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [login, { loading }] = useMutation(LOGIN_MUTATION)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    try {
      const { data } = await login({
        variables: { input: { email, password } },
      })

      const payload = data?.login
      if (!payload) {
        setError("Login failed")
        return
      }

      saveAuthSession(payload)
      const user = {
        ...payload.user,
        role: String(payload.user.role).toLowerCase(),
      }

      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "recruiter") {
        if (!user.isOnboarded || !user.companyId) {
          router.push("/recruiter/onboarding")
        } else {
          router.push("/recruiter/dashboard")
        }
      } else if (user.role === "candidate") {
        if (!user.isOnboarded) {
          router.push("/candidate/onboarding")
        } else {
          router.push("/candidate/feed")
        }
      }
    } catch (err) {
      setError(getGraphQLErrorMessage(err))
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-semibold mb-8 text-center">
        Login
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full h-[52px] px-4 rounded-md border border-gray-200 focus:outline-none focus:border-[#0073FF]"
        />

       <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full h-[50px] px-4 pr-12 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0073FF]"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute inset-y-0 right-4 flex items-center text-gray-500"
  >
    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
  </button>
</div>


        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            Remember me
          </label>

          <Link href="/forgot-password" className="text-[#0073FF]">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[52px] bg-[#0073FF] text-white rounded-md font-medium hover:bg-[#005fe0] transition disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-sm text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="flex justify-center gap-4">
          {["facebook", "instagram", "x", "linkedin"].map((s) => (
            <div
              key={s}
              className="w-10 h-10 flex items-center justify-center rounded bg-gray-100 cursor-pointer hover:bg-gray-200"
            >
              <i className={`ri-${s}-fill`} />
            </div>
          ))}
        </div>

        <p className="text-center text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#0073FF]">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}
