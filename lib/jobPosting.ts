import { JOB_POSTING_ELIGIBILITY_QUERY } from "@/lib/graphql/queries";
import { graphqlRequest } from "@/lib/graphql/server";

export type JobPostingEligibility = {
  canPost: boolean;
  plan?: string;
  planLabel?: string;
  activeJobs?: number;
  baseLimit?: number | "Unlimited";
  bonusCredits?: number;
  effectiveLimit?: number | "Unlimited";
  remaining?: number | null;
  isUnlimited?: boolean;
  upgradeRequired?: boolean;
  message?: string;
};

type EligibilityResponse = {
  jobPostingEligibility: {
    canPost: boolean;
    plan: string;
    activeJobs: number;
    effectiveLimit: string;
    remaining: number | null;
    message?: string | null;
  };
};

export async function fetchJobPostingEligibility(
  token: string
): Promise<JobPostingEligibility> {
  const data = await graphqlRequest<EligibilityResponse>(
    JOB_POSTING_ELIGIBILITY_QUERY,
    undefined,
    { token }
  );

  const e = data.jobPostingEligibility;
  const isUnlimited = e.effectiveLimit === "Unlimited";

  return {
    canPost: e.canPost,
    plan: e.plan,
    planLabel: e.plan.charAt(0).toUpperCase() + e.plan.slice(1),
    activeJobs: e.activeJobs,
    effectiveLimit: isUnlimited ? "Unlimited" : Number(e.effectiveLimit),
    remaining: e.remaining,
    isUnlimited,
    upgradeRequired: !e.canPost,
    message: e.message ?? undefined,
  };
}
