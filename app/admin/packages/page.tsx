"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@/lib/apollo/hooks";
import {
  clearAuthSession,
  getStoredAccessToken,
  isUnauthorizedError,
} from "@/lib/auth/session";
import { ADMIN_PAYMENT_STATS_QUERY } from "@/lib/graphql/operations";
import {
  BANNER_PACKAGES,
  formatInr,
  RECRUITMENT_PACKAGES,
  SPONSORED_CONTENT_PACKAGES,
  SUBSCRIPTION_PLANS,
} from "@/lib/packages";

type Purchase = {
  id: string;
  packageType: string;
  packageId: string;
  packageName: string;
  amount: number;
  status: string;
  createdAt: string;
  user?: { email: string; fullName?: string };
  company?: { name: string };
};

export default function AdminPackagesPage() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(!!getStoredAccessToken());
  }, []);

  const { data, loading, error, refetch } = useQuery(ADMIN_PAYMENT_STATS_QUERY, {
    skip: !authReady,
    fetchPolicy: "network-only",
  });

  const stats = data?.adminPaymentStats;
  const purchases: Purchase[] = stats?.recentPurchases ?? [];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-gray-500">Loading package data...</p>
      </div>
    );
  }

  if (error) {
    const unauthorized = isUnauthorizedError(error);

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-800">Could not load payment stats</p>
        <p className="mt-2 text-sm text-red-700">
          {unauthorized
            ? "Your admin session expired or is invalid. Please log in again."
            : error.message}
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          {unauthorized ? (
            <Link
              href="/admin/login"
              onClick={() => clearAuthSession()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Go to admin login
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Packages &amp; Payments</h2>
        <p className="mt-1 text-sm text-gray-500">
          Package catalog and purchase activity from the GraphQL API.
        </p>
      </div>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Revenue Overview</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard label="Total Revenue" value={formatInr(stats?.totalRevenue ?? 0)} />
          <StatCard label="Paid Orders" value={String(stats?.paidCount ?? 0)} tone="emerald" />
          <StatCard label="Pending Orders" value={String(stats?.pendingCount ?? 0)} tone="amber" />
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Subscription Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {(stats?.planBreakdown ?? []).length > 0 ? (
            stats?.planBreakdown.map((row: { plan: string; planLabel: string; count: number }) => (
              <div key={row.plan} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-600">{row.planLabel}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{row.count}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-sm text-gray-500">No company subscriptions yet.</p>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Subscription Plans</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Annual Price</th>
              </tr>
            </thead>
            <tbody>
              {SUBSCRIPTION_PLANS.map((plan) => (
                <tr key={plan.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{plan.name}</td>
                  <td className="px-4 py-3 text-gray-600">{plan.id}</td>
                  <td className="px-4 py-3">{formatInr(plan.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Banner Packages</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Monthly</th>
                <th className="px-4 py-3">Quarterly</th>
                <th className="px-4 py-3">Annual</th>
              </tr>
            </thead>
            <tbody>
              {BANNER_PACKAGES.map((pkg) => (
                <tr key={pkg.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{pkg.position}</td>
                  <td className="px-4 py-3">{formatInr(pkg.monthly)}</td>
                  <td className="px-4 py-3">{formatInr(pkg.quarterly)}</td>
                  <td className="px-4 py-3">{formatInr(pkg.annual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Sponsored Content</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {SPONSORED_CONTENT_PACKAGES.map((pkg) => (
            <div key={pkg.id} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{pkg.name}</p>
              <p className="mt-1 text-lg font-bold text-indigo-700">{formatInr(pkg.price)}</p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {pkg.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Recruitment Packages</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {RECRUITMENT_PACKAGES.map((pkg) => (
                <tr key={pkg.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{pkg.name}</td>
                  <td className="px-4 py-3 text-gray-600">{pkg.id}</td>
                  <td className="px-4 py-3">{formatInr(pkg.price)}</td>
                  <td className="px-4 py-3">{pkg.durationDays} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-gray-800">Recent Purchases</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          {purchases.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No purchases recorded yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">Package</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{purchase.packageName}</td>
                    <td className="px-4 py-3">{purchase.packageType}</td>
                    <td className="px-4 py-3">
                      {purchase.user?.fullName || purchase.user?.email || "—"}
                    </td>
                    <td className="px-4 py-3">{purchase.company?.name || "—"}</td>
                    <td className="px-4 py-3">{formatInr(purchase.amount ?? 0)}</td>
                    <td className="px-4 py-3">{purchase.status}</td>
                    <td className="px-4 py-3">
                      {purchase.createdAt
                        ? new Date(purchase.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "indigo",
}: {
  label: string;
  value: string;
  tone?: "indigo" | "emerald" | "amber";
}) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "amber"
        ? "text-amber-700"
        : "text-indigo-700";

  return (
    <div className="rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-600">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}
