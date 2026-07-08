"use client";

import { ApolloProvider } from "@/lib/apollo/hooks";
import { useMemo } from "react";
import { createApolloClient } from "./client";

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
