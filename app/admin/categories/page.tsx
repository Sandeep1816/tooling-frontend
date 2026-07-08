"use client";

import { useState } from "react";
import { useMutation } from "@/lib/apollo/hooks";
import { CREATE_CATEGORY_MUTATION } from "@/lib/graphql/operations";
import { getGraphQLErrorMessage } from "@/lib/auth/session";

export default function CreateCategory() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
  });
  const [message, setMessage] = useState("");

  const [createCategory, { loading }] = useMutation(CREATE_CATEGORY_MUTATION);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await createCategory({
        variables: { input: form },
      });
      setMessage("✅ Category created successfully!");
      setForm({ name: "", slug: "" });
    } catch (err) {
      setMessage(`❌ Failed: ${getGraphQLErrorMessage(err)}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Category Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="slug"
          placeholder="Slug (e.g. basics)"
          value={form.slug}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Category"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
