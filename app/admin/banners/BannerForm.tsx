"use client";

import { useState, useEffect } from "react";
import { BANNER_PLACEMENTS } from "@/lib/bannerPlacements";
import { getUploadUrl } from "@/lib/graphql/server";

type BannerPlacement = (typeof BANNER_PLACEMENTS)[number]["value"];

export type BannerFormData = {
  title: string;
  imageUrl: string;
  targetUrl: string;
  placement: BannerPlacement;
  status: "ACTIVE" | "INACTIVE";
};

type BannerFormProps = {
  initialData?: Partial<BannerFormData>;
  onSubmit: (data: BannerFormData) => Promise<void>;
};

export default function BannerForm({
  initialData,
  onSubmit,
}: BannerFormProps) {
  const [title, setTitle] = useState("");
  const [targetUrl, setTargetUrl] = useState("");

  const [placement, setPlacement] = useState<BannerPlacement>(
    BANNER_PLACEMENTS[0].value as BannerPlacement
  );

  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    setTitle(initialData.title ?? "");
    setTargetUrl(initialData.targetUrl ?? "");
    setPlacement(
      (initialData.placement ??
        BANNER_PLACEMENTS[0].value) as BannerPlacement
    );
    setStatus((initialData.status as "ACTIVE" | "INACTIVE") ?? "ACTIVE");
    setImageUrl(initialData.imageUrl ?? "");
  }, [initialData]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(getUploadUrl(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    if (!res.ok) {
      alert("Upload failed");
      return;
    }

    const data = await res.json();
    setImageUrl(data.imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        title,
        imageUrl,
        targetUrl,
        placement,
        status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block font-medium mb-1">Banner Title</label>
        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Redirect URL</label>
        <input
          className="w-full border p-2 rounded"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Placement</label>
        <select
          className="w-full border p-2 rounded"
          value={placement}
          onChange={(e) =>
            setPlacement(e.target.value as BannerPlacement)
          }
        >
          {BANNER_PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Status</label>
        <select
          className="w-full border p-2 rounded"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "ACTIVE" | "INACTIVE")
          }
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Banner Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadImage(file);
          }}
        />

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Banner Preview"
            className="mt-3 w-full rounded border"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={!imageUrl || loading}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Banner"}
      </button>
    </form>
  );
}
