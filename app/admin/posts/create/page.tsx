"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useMutation, useQuery } from "@/lib/apollo/hooks";
import UploadBox from "@/components/UploadBox";
import {
  AUTHORS_QUERY,
  CATEGORIES_QUERY,
  CREATE_POST_MUTATION,
} from "@/lib/graphql/operations";
import {
  getGraphQLErrorMessage,
  getStoredAccessToken,
} from "@/lib/auth/session";
import { getUploadUrl } from "@/lib/graphql/server";

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
      Loading editor...
    </div>
  ),
});

export default function CreatePost() {
  const [authReady, setAuthReady] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    badge: "",
    imageUrl: "",
    excerpt: "",
    content: "",
    authorId: "",
    categoryId: "",
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    email: "",
    whatsappNumber: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAuthReady(!!getStoredAccessToken());
  }, []);

  const {
    data: authorsData,
    loading: authorsLoading,
    error: authorsError,
  } = useQuery(AUTHORS_QUERY, { skip: !authReady });

  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(CATEGORIES_QUERY, { skip: !authReady });

  const [createPost] = useMutation(CREATE_POST_MUTATION);

  const authors = authorsData?.authors ?? [];
  const categories = categoriesData?.categories ?? [];
  const metaLoading = !authReady || authorsLoading || categoriesLoading;
  const metaError = authorsError || categoriesError;

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setForm((prev) => ({ ...prev, title, slug }));
  }

  function handleChange(
    e:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setMessage("Uploading image...");

    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = getStoredAccessToken();

      const res = await fetch(getUploadUrl(), {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
        setMessage("Image uploaded successfully.");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      setMessage(
        `Image upload failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const excerpt =
      form.excerpt.trim() ||
      `${form.content.replace(/<[^>]+>/g, "").substring(0, 150)}...`;

    try {
      await createPost({
        variables: {
          input: {
            title: form.title,
            slug: form.slug,
            excerpt,
            content: form.content,
            badge: form.badge || null,
            imageUrl: form.imageUrl || null,
            facebookUrl: form.facebookUrl || null,
            linkedinUrl: form.linkedinUrl || null,
            twitterUrl: form.twitterUrl || null,
            youtubeUrl: form.youtubeUrl || null,
            email: form.email || null,
            whatsappNumber: form.whatsappNumber || null,
            authorId: form.authorId,
            categoryId: form.categoryId,
          },
        },
      });

      setMessage("Post created successfully.");
      setForm({
        title: "",
        slug: "",
        badge: "",
        imageUrl: "",
        excerpt: "",
        content: "",
        authorId: "",
        categoryId: "",
        facebookUrl: "",
        linkedinUrl: "",
        twitterUrl: "",
        youtubeUrl: "",
        email: "",
        whatsappNumber: "",
      });
    } catch (err) {
      setMessage(getGraphQLErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (metaLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading post form...</p>
      </div>
    );
  }

  if (metaError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-800">Could not load authors or categories</p>
        <p className="mt-2 text-sm text-red-700">{metaError.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add a new article to the site. Authors and categories are required.
        </p>
      </div>

      {(authors.length === 0 || categories.length === 0) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Setup required before creating posts</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {categories.length === 0 && (
              <li>
                No categories found.{" "}
                <Link href="/admin/categories" className="font-medium underline">
                  Add a category
                </Link>
              </li>
            )}
            {authors.length === 0 && (
              <li>
                No authors found.{" "}
                <Link href="/admin/authors" className="font-medium underline">
                  Add an author
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleTitleChange}
          required
          placeholder="Title"
          className="w-full rounded-lg border p-3"
        />

        <input
          type="text"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          required
          placeholder="Slug"
          className="w-full rounded-lg border p-3"
        />

        <input
          type="text"
          name="badge"
          value={form.badge}
          onChange={handleChange}
          placeholder="Badge (FEATURED, WEBINAR, EVENT)"
          className="w-full rounded-lg border p-3"
        />

        <UploadBox
          label="Featured Image"
          value={form.imageUrl}
          onUpload={handleImageUpload}
          height="h-64"
        />

        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        >
          <option value="">Select category</option>
          {categories.map((category: { id: string; name: string }) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="authorId"
          value={form.authorId}
          onChange={handleChange}
          required
          className="w-full rounded-lg border p-3"
        >
          <option value="">Select author</option>
          {authors.map((author: { id: string; name: string }) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>

        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          rows={3}
          placeholder="Short summary"
          className="w-full rounded-lg border p-3"
        />

        <div>
          <label className="mb-2 block font-semibold">Post Content</label>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
            className="bg-white"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Social &amp; Contact (Optional)</h3>
          <input
            name="facebookUrl"
            value={form.facebookUrl}
            onChange={handleChange}
            placeholder="Facebook URL"
            className="w-full rounded-lg border p-3"
          />
          <input
            name="linkedinUrl"
            value={form.linkedinUrl}
            onChange={handleChange}
            placeholder="LinkedIn URL"
            className="w-full rounded-lg border p-3"
          />
          <input
            name="twitterUrl"
            value={form.twitterUrl}
            onChange={handleChange}
            placeholder="Twitter/X URL"
            className="w-full rounded-lg border p-3"
          />
          <input
            name="youtubeUrl"
            value={form.youtubeUrl}
            onChange={handleChange}
            placeholder="YouTube URL"
            className="w-full rounded-lg border p-3"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Contact Email"
            className="w-full rounded-lg border p-3"
          />
          <input
            name="whatsappNumber"
            value={form.whatsappNumber}
            onChange={handleChange}
            placeholder="WhatsApp Number"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            uploading ||
            authors.length === 0 ||
            categories.length === 0 ||
            !form.content.trim()
          }
          className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Post"}
        </button>

        {message && <p className="text-center text-sm">{message}</p>}
      </form>
    </div>
  );
}
