"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@/lib/apollo/hooks";
import { LOGIN_MUTATION } from "@/lib/graphql/operations";
import { getGraphQLErrorMessage, saveAuthSession } from "@/lib/auth/session";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const { data } = await login({
        variables: { input: { email, password } },
      });

      const payload = data?.login;
      if (!payload) {
        setError("Invalid credentials");
        return;
      }

      const role = String(payload.user.role).toLowerCase();
      if (role !== "admin") {
        setError("Admin access only");
        return;
      }

      saveAuthSession(payload);
      router.push("/admin/dashboard");
    } catch (err) {
      setError(getGraphQLErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
