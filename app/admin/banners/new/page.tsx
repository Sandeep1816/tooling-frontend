"use client";

import { useMutation } from "@/lib/apollo/hooks";
import BannerForm, { type BannerFormData } from "../BannerForm";
import { CREATE_BANNER_MUTATION } from "@/lib/graphql/operations";

export default function NewBannerPage() {
  const [createBanner] = useMutation(CREATE_BANNER_MUTATION);

  const handleCreate = async (data: BannerFormData) => {
    try {
      await createBanner({
        variables: {
          input: {
            title: data.title,
            imageUrl: data.imageUrl,
            targetUrl: data.targetUrl || null,
            placement: data.placement,
            status: data.status,
          },
        },
      });
      alert("Banner created successfully");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to create banner");
      throw err;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Banner</h1>
      <BannerForm onSubmit={handleCreate} />
    </div>
  );
}
