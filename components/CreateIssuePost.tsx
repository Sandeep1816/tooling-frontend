"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useMutation, useQuery } from "@/lib/apollo/hooks";
import UploadBox from "@/components/UploadBox";
import {
  AUTHORS_QUERY,
  CATEGORIES_QUERY,
  CREATE_POST_MUTATION,
} from "@/lib/graphql/operations";
import { getGraphQLErrorMessage } from "@/lib/auth/session";
import { getUploadUrl } from "@/lib/graphql/server";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function CreateIssuePost() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
    imageUrl: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",
  });

  const [authors, setAuthors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: authorsData } = useQuery(AUTHORS_QUERY);
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const [createPost] = useMutation(CREATE_POST_MUTATION);

  useEffect(() => {
    if (authorsData?.authors) setAuthors(authorsData.authors);
  }, [authorsData]);

  useEffect(() => {
    if (!categoriesData?.categories) return;

    const allowedCategories = ["inthisissue", "whatsnew"];
    const filtered = categoriesData.categories.filter((cat: { slug?: string }) =>
      allowedCategories.includes(cat.slug?.toLowerCase() ?? "")
    );
    setCategories(filtered);
  }, [categoriesData]);

  /* ================= AUTO SLUG ================= */
  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setForm(prev => ({ ...prev, title, slug }));
  }

  function handleChange(
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  /* ================= IMAGE UPLOAD ================= */
  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(getUploadUrl(), {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
      }
    } finally {
      setUploading(false);
    }
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    const excerpt =
      form.excerpt.trim() ||
      form.content.replace(/<[^>]+>/g, "").substring(0, 150) + "...";

    try {
      await createPost({
        variables: {
          input: {
            title: form.title,
            slug: form.slug,
            badge: form.badge || null,
            imageUrl: form.imageUrl || null,
            excerpt,
            content: form.content,
            authorId: form.authorId,
            categoryId: form.categoryId,
          },
        },
        context: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      });

      setMessage("✅ Issue created successfully!");
      setForm({
        title: "",
        slug: "",
        badge: "",
        imageUrl: "",
        excerpt: "",
        content: "",
        authorId: "",
        categoryId: "",
      });
    } catch (err) {
      setMessage(`❌ ${getGraphQLErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        📘 Create New Issue
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* TITLE */}
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleTitleChange}
          required
          placeholder="Title"
          className="w-full p-3 border rounded-lg"
        />

        {/* SLUG */}
        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          required
          placeholder="Slug"
          className="w-full p-3 border rounded-lg"
        />

        {/* BADGE */}
        <input
          type="text"
          name="badge"
          value={form.badge}
          onChange={handleChange}
          placeholder="Badge (FEATURED, WEBINAR, EVENT)"
          className="w-full p-3 border rounded-lg"
        />

        {/* IMAGE */}
        <UploadBox
          label="Featured Image"
          value={form.imageUrl}
          onUpload={handleImageUpload}
          height="h-64"
        />

        {/* CATEGORY */}
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg"
        >
          <option value="">Select category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* AUTHOR */}
        <select
          name="authorId"
          value={form.authorId}
          onChange={handleChange}
          required
          className="w-full p-3 border rounded-lg"
        >
          <option value="">Select author</option>
          {authors.map(a => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* SHORT SUMMARY */}
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          rows={3}
          placeholder="Short summary"
          className="w-full p-3 border rounded-lg"
        />

        {/* CONTENT */}
        <div>
          <label className="block font-semibold mb-2">
            Post Content
          </label>

          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) =>
              setForm(prev => ({ ...prev, content: value }))
            }
            className="bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Creating..." : "🚀 Create Post"}
        </button>

        {message && (
          <p className="text-center text-sm">{message}</p>
        )}
      </form>
    </div>
  );
}
