"use client";

import { useMutation, useQuery } from "@/lib/apollo/hooks";
import {
  COMPANY_BY_SLUG_QUERY,
  FOLLOW_COMPANY_MUTATION,
  UNFOLLOW_COMPANY_MUTATION,
} from "@/lib/graphql/operations";
import { getGraphQLErrorMessage } from "@/lib/auth/session";

export function useCompanyProfile(slug: string) {
  const { data, loading, refetch } = useQuery(COMPANY_BY_SLUG_QUERY, {
    variables: { slug },
    skip: !slug,
  });

  const [followCompany] = useMutation(FOLLOW_COMPANY_MUTATION);
  const [unfollowCompany] = useMutation(UNFOLLOW_COMPANY_MUTATION);

  const company = data?.company ?? null;
  const following = Boolean(company?.isFollowing);

  async function toggleFollow() {
    if (!company) return false;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Login required");
      return false;
    }

    try {
      if (following) {
        await unfollowCompany({ variables: { companyId: company.id } });
      } else {
        await followCompany({ variables: { companyId: company.id } });
      }
      await refetch();
      return true;
    } catch (err) {
      alert(getGraphQLErrorMessage(err));
      return false;
    }
  }

  return { company, loading, following, toggleFollow, refetch };
}
