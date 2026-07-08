"use client";

import { useMutation, useQuery } from "@/lib/apollo/hooks";
import { useRouter, useParams } from "next/navigation";
import BannerForm, { type BannerFormData } from "../../BannerForm";
import {
  BANNER_BY_ID_QUERY,
  UPDATE_BANNER_MUTATION,
} from "@/lib/graphql/operations";

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, loading } = useQuery(BANNER_BY_ID_QUERY, {
    variables: { id },
    skip: !id,
  });

  const [updateBanner] = useMutation(UPDATE_BANNER_MUTATION);

  const banner = data?.bannerById ?? null;

  const handleUpdate = async (updatedData: BannerFormData) => {
    try {
      await updateBanner({
        variables: {
          id,
          input: {
            title: updatedData.title,
            imageUrl: updatedData.imageUrl,
            targetUrl: updatedData.targetUrl || null,
            placement: updatedData.placement,
            status: updatedData.status,
          },
        },
      });

      alert("Banner updated successfully");
      router.push("/admin/banners");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update banner");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!banner) return <p className="p-6 text-red-500">Banner not found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Banner</h1>
      <BannerForm initialData={banner} onSubmit={handleUpdate} />
    </div>
  );
}
