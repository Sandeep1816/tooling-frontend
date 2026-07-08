import {
  ARTICLE_POSTING_ELIGIBILITY_QUERY,
  PRODUCT_LISTING_ELIGIBILITY_QUERY,
} from "@/lib/graphql/queries";
import { graphqlRequest } from "@/lib/graphql/server";

export type ContentLimitEligibility = {
  canCreate?: boolean;
  canAdd?: boolean;
  plan?: string;
  planLabel?: string;
  articlesThisYear?: number;
  activeListings?: number;
  effectiveLimit?: number | "Unlimited";
  remaining?: number | null;
  isUnlimited?: boolean;
  periodLabel?: string;
  upgradeRequired?: boolean;
  message?: string;
};

type ProductListingResponse = {
  productListingEligibility: {
    canAdd: boolean;
    plan: string;
    activeListings: number;
    effectiveLimit: string;
    remaining: number | null;
    message?: string | null;
  };
};

type ArticlePostingResponse = {
  articlePostingEligibility: {
    canCreate: boolean;
    plan: string;
    planLabel: string;
    articlesThisYear: number;
    effectiveLimit: string;
    remaining: number | null;
    isUnlimited: boolean;
    periodLabel: string;
    upgradeRequired: boolean;
    message?: string | null;
  };
};

export async function fetchArticlePostingEligibility(
  token: string
): Promise<ContentLimitEligibility> {
  const data = await graphqlRequest<ArticlePostingResponse>(
    ARTICLE_POSTING_ELIGIBILITY_QUERY,
    undefined,
    { token }
  );

  const e = data.articlePostingEligibility;
  const isUnlimited = e.effectiveLimit === "Unlimited";

  return {
    canCreate: e.canCreate,
    plan: e.plan,
    planLabel: e.planLabel,
    articlesThisYear: e.articlesThisYear,
    effectiveLimit: isUnlimited ? "Unlimited" : Number(e.effectiveLimit),
    remaining: e.remaining,
    isUnlimited: e.isUnlimited,
    periodLabel: e.periodLabel,
    upgradeRequired: e.upgradeRequired,
    message: e.message ?? undefined,
  };
}

export async function fetchProductListingEligibility(
  token: string
): Promise<ContentLimitEligibility> {
  const data = await graphqlRequest<ProductListingResponse>(
    PRODUCT_LISTING_ELIGIBILITY_QUERY,
    undefined,
    { token }
  );

  const e = data.productListingEligibility;
  const isUnlimited = e.effectiveLimit === "Unlimited";

  return {
    canAdd: e.canAdd,
    plan: e.plan,
    planLabel: e.plan.charAt(0).toUpperCase() + e.plan.slice(1),
    activeListings: e.activeListings,
    effectiveLimit: isUnlimited ? "Unlimited" : Number(e.effectiveLimit),
    remaining: e.remaining,
    isUnlimited,
    upgradeRequired: !e.canAdd,
    message: e.message ?? undefined,
  };
}
