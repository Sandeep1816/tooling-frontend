"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink, User } from "lucide-react";
import UploadBox from "@/components/UploadBox";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";
import {
  fetchMyCandidateProfile,
  syncCandidateUserInStorage,
  updateMyCandidateProfile,
  uploadCandidateImage,
  type CandidateProfile,
} from "@/lib/candidateProfile";

type CandidateProfilePanelProps = {
  onProfileUpdated?: (profile: CandidateProfile) => void;
};

export default function CandidateProfilePanel({
  onProfileUpdated,
}: CandidateProfilePanelProps) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMyCandidateProfile()
      .then(setProfile)
      .catch((err) => console.error("Failed to load profile", err))
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
      onProfileUpdated?.(updated);
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
      onProfileUpdated?.(updated);
      syncCandidateUserInStorage(updated);
      setMessage("Profile saved successfully.");
    } catch {
      setMessage("Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center text-sm text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center text-sm text-red-600">
        Unable to load your profile.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-blue-600 to-indigo-600" />

      <div className="px-6 pb-6 -mt-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex items-end gap-4">
            <CandidateAvatar
              avatarUrl={profile.avatarUrl}
              name={profile.fullName || profile.username}
              size="lg"
              borderClassName="border-4 border-white"
            />
            <div className="pb-1">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                {profile.fullName || profile.username}
              </h2>
              <p className="text-sm text-gray-500">@{profile.username}</p>
            </div>
          </div>

          <Link
            href={`/candidate/${profile.username}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View public profile
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Email" value={profile.email} disabled />
            <Field label="Username" value={profile.username} disabled />
          </div>

          <input
            placeholder="Full name"
            value={profile.fullName || ""}
            onChange={(e) =>
              setProfile({ ...profile, fullName: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <input
            placeholder="Headline"
            value={profile.headline || ""}
            onChange={(e) =>
              setProfile({ ...profile, headline: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <input
            placeholder="Location"
            value={profile.location || ""}
            onChange={(e) =>
              setProfile({ ...profile, location: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <input
            placeholder="Website URL"
            value={profile.websiteUrl || ""}
            onChange={(e) =>
              setProfile({ ...profile, websiteUrl: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          <textarea
            placeholder="About you"
            rows={5}
            value={profile.about || ""}
            onChange={(e) =>
              setProfile({ ...profile, about: e.target.value })
            }
            className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm"
          />

          {message && (
            <p
              className={`text-sm ${
                message.toLowerCase().includes("could not")
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
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile details"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  disabled,
}: {
  label: string;
  value: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        value={value}
        disabled={disabled}
        className="w-full border border-gray-200 px-3 py-2 rounded-md text-sm bg-gray-50 mt-1"
      />
    </div>
  );
}
