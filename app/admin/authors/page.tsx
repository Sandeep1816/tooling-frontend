"use client";

import { useState } from "react";
import { useMutation } from "@/lib/apollo/hooks";
import { CREATE_AUTHOR_MUTATION } from "@/lib/graphql/operations";
import { getGraphQLErrorMessage } from "@/lib/auth/session";

export default function CreateAuthor() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
  });
  const [message, setMessage] = useState("");

  const [createAuthor, { loading }] = useMutation(CREATE_AUTHOR_MUTATION);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await createAuthor({
        variables: {
          input: {
            name: form.name,
            bio: form.bio || null,
            avatarUrl: form.avatarUrl || null,
          },
        },
      });
      setMessage("✅ Author created successfully!");
      setForm({ name: "", bio: "", avatarUrl: "" });
    } catch (err) {
      setMessage(`❌ Failed: ${getGraphQLErrorMessage(err)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Author</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Author Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="bio"
          placeholder="Author Bio"
          value={form.bio}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <input
          type="url"
          name="avatarUrl"
          placeholder="Avatar URL"
          value={form.avatarUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Author"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
