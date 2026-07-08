"use client";

import { getApolloClient } from "@/lib/apollo/client";
import {
  ACTIVATE_FREE_PLAN_MUTATION,
  CREATE_PAYMENT_ORDER_MUTATION,
  VERIFY_PAYMENT_MUTATION,
} from "@/lib/graphql/operations";

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  theme?: { color?: string };
  handler: (response: RazorpayHandlerResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: { error: { description: string } }) => void) => void;
    };
  }
}

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type PackageType = "SUBSCRIPTION" | "BANNER" | "SPONSORED" | "RECRUITMENT";

export async function startPackagePayment({
  packageType,
  packageId,
  onSuccess,
  onError,
}: {
  packageType: PackageType;
  packageId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = `/signup?role=recruiter&redirect=${encodeURIComponent("/packages")}`;
    return;
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    onError?.("Failed to load payment gateway");
    return;
  }

  const client = getApolloClient();

  try {
    const { data } = await client.mutate<{
      createPaymentOrder: {
        keyId: string
        amount: number
        currency: string
        orderId: string
        packageName: string
        prefill?: { name?: string; email?: string }
      }
    }>({
      mutation: CREATE_PAYMENT_ORDER_MUTATION,
      variables: {
        input: { packageType, packageId },
      },
    });

    const orderData = data?.createPaymentOrder;
    if (!orderData) {
      onError?.("Could not start payment");
      return;
    }

    const rzp = new window.Razorpay({
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Tooling Trends",
      description: orderData.packageName,
      order_id: orderData.orderId,
      prefill: orderData.prefill,
      theme: { color: "#004d73" },
      handler: async (response) => {
        const { data: verifyData } = await client.mutate<{
          verifyPayment: { success: boolean }
        }>({
          mutation: VERIFY_PAYMENT_MUTATION,
          variables: {
            input: {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          },
        });

        if (!verifyData?.verifyPayment?.success) {
          onError?.("Payment verification failed");
          return;
        }

        onSuccess?.();
        window.location.href = "/packages/success";
      },
      modal: {
        ondismiss: () => onError?.("Payment cancelled"),
      },
    });

    rzp.on("payment.failed", (response) => {
      onError?.(response.error.description || "Payment failed");
    });

    rzp.open();
  } catch (err: unknown) {
    onError?.(err instanceof Error ? err.message : "Something went wrong. Please try again.");
  }
}

export async function activateFreePlan({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = `/signup?role=recruiter&redirect=${encodeURIComponent("/packages")}`;
    return;
  }

  const client = getApolloClient();

  try {
    const { data } = await client.mutate<{
      activateFreePlan: { success?: boolean; alreadyActive?: boolean; message?: string }
    }>({
      mutation: ACTIVATE_FREE_PLAN_MUTATION,
    });

    const result = data?.activateFreePlan;
    if (!result?.success && !result?.alreadyActive) {
      onError?.(result?.message || "Could not activate free plan");
      return;
    }

    if (result.alreadyActive) {
      onSuccess?.();
      window.location.href = "/recruiter/dashboard";
      return;
    }

    onSuccess?.();
    window.location.href = "/packages/success?plan=free";
  } catch (err: unknown) {
    onError?.(err instanceof Error ? err.message : "Something went wrong. Please try again.");
  }
}
