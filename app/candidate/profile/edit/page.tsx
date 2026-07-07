"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadBox from "@/components/UploadBox";
import {
  fetchMyCandidateProfile,
  syncCandidateUserInStorage,
  updateMyCandidateProfile,
  uploadCandidateImage,
  type CandidateProfile,
} from "@/lib/candidateProfile";

export default function EditCandidateProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMyCandidateProfile()
      .then(setProfile)
      .catch(() => setMessage("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAvatarUpload(file: File) {
    if (!profile) return;

    setUploading(true);
    setMessage("");
    try {
      const imageUrl = await uploadCandidateImage(file);
      const updated = await updateMyCandidateProfile({
        ...profile,
        avatarUrl: imageUrl,
      });
      setProfile(updated);
      syncCandidateUserInStorage(updated);
      setMessage("Profile photo updated.");
    } catch {
      setMessage("Could not upload profile photo. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage("");
    try {
      const updated = await updateMyCandidateProfile(profile);
      setProfile(updated);
      syncCandidateUserInStorage(updated);
      setMessage("Profile saved successfully.");
      setTimeout(() => router.push("/candidate/feed"), 1000);
    } catch {
      setMessage("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !profile) {
    return <p className="p-6">Loading…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="max-w-xs">
          <UploadBox
            label={uploading ? "Uploading photo..." : "Profile photo"}
            value={profile.avatarUrl}
            onUpload={handleAvatarUpload}
            height="h-40"
            accept="image/*"
          />
          <p className="text-xs text-gray-500 mt-2">
            Click the image area to upload a new photo. Changes save automatically.
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Email</label>
          <input
            value={profile.email}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 mt-1"
          />
        </div>

        <div>
          <label className="text-sm text-gray-500">Username</label>
          <input
            value={profile.username}
            disabled
            className="w-full border px-3 py-2 rounded bg-gray-100 mt-1"
          />
        </div>

        <input
          placeholder="Full name"
          value={profile.fullName || ""}
          onChange={(e) =>
            setProfile({ ...profile, fullName: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Headline"
          value={profile.headline || ""}
          onChange={(e) =>
            setProfile({ ...profile, headline: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Location"
          value={profile.location || ""}
          onChange={(e) =>
            setProfile({ ...profile, location: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <input
          placeholder="Website URL"
          value={profile.websiteUrl || ""}
          onChange={(e) =>
            setProfile({ ...profile, websiteUrl: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        <textarea
          placeholder="About you"
          rows={5}
          value={profile.about || ""}
          onChange={(e) =>
            setProfile({ ...profile, about: e.target.value })
          }
          className="w-full border px-3 py-2 rounded"
        />

        {message && (
          <p
            className={`text-sm ${
              message.toLowerCase().includes("could not") ||
              message.toLowerCase().includes("failed")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
