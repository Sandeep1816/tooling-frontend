"use client";

import type { DocumentNode, OperationVariables, TypedDocumentNode } from "@apollo/client";
import {
  ApolloProvider,
  useApolloClient as apolloUseApolloClient,
  useLazyQuery as apolloUseLazyQuery,
  useMutation as apolloUseMutation,
  useQuery as apolloUseQuery,
} from "@apollo/client/react";

export { ApolloProvider };

export function useQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: { skip?: boolean } & Record<string, unknown>,
) {
  const skipOnServer = typeof window === "undefined";
  const mergedOptions = {
    ...options,
    skip: options?.skip || skipOnServer,
  };

  return apolloUseQuery<TData, TVariables>(query, mergedOptions as never);
}

export function useLazyQuery<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: object,
) {
  return apolloUseLazyQuery<TData, TVariables>(query, options as never);
}

export function useMutation<
  TData = any,
  TVariables extends OperationVariables = OperationVariables,
>(
  mutation: DocumentNode | TypedDocumentNode<TData, TVariables>,
  options?: object,
) {
  return apolloUseMutation<TData, TVariables>(mutation, options as never);
}

export function useApolloClient() {
  return apolloUseApolloClient();
}
