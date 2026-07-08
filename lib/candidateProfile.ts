import { getApolloClient } from "@/lib/apollo/client";
import { ME_QUERY, UPDATE_USER_MUTATION } from "@/lib/graphql/operations";
import { getUploadUrl } from "@/lib/graphql/server";

type CandidateProfile = {
  id?: string;
  email: string;
  username: string;
  fullName?: string;
  headline?: string;
  about?: string;
  location?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  isOnboarded?: boolean;
};

export async function uploadCandidateImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const res = await fetch(getUploadUrl(), {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.imageUrl) {
    throw new Error(data.error || "Image upload failed");
  }

  return data.imageUrl;
}

export async function fetchMyCandidateProfile(): Promise<CandidateProfile> {
  const client = getApolloClient();
  const { data } = await client.query<{ me: CandidateProfile }>({
    query: ME_QUERY,
    fetchPolicy: "network-only",
  });

  if (!data?.me) {
    throw new Error("Failed to load profile");
  }

  return data.me;
}

export async function updateMyCandidateProfile(
  profile: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  const client = getApolloClient();

  let userId = profile.id;
  if (!userId) {
    const { data: meData } = await client.query<{ me: CandidateProfile }>({
      query: ME_QUERY,
      fetchPolicy: "network-only",
    });
    userId = meData?.me?.id;
  }

  if (!userId) {
    throw new Error("Not authenticated");
  }

  const { data } = await client.mutate<{ updateUser: CandidateProfile }>({
    mutation: UPDATE_USER_MUTATION,
    variables: {
      id: userId,
      input: {
        fullName: profile.fullName,
        headline: profile.headline,
        about: profile.about,
        location: profile.location,
        avatarUrl: profile.avatarUrl,
        websiteUrl: profile.websiteUrl,
        isOnboarded: profile.isOnboarded,
      },
    },
  });

  if (!data?.updateUser) {
    throw new Error("Failed to update profile");
  }

  return data.updateUser;
}

export function syncCandidateUserInStorage(profile: CandidateProfile) {
  const stored = localStorage.getItem("user");
  if (!stored) return;

  const existing = JSON.parse(stored);
  localStorage.setItem(
    "user",
    JSON.stringify({
      ...existing,
      avatarUrl: profile.avatarUrl,
      fullName: profile.fullName,
      username: profile.username,
      isOnboarded: profile.isOnboarded ?? existing.isOnboarded,
    })
  );
  window.dispatchEvent(new Event("userChanged"));
}

export type { CandidateProfile };
