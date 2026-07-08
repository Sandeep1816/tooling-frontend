"use client"

import { useEffect } from "react"
import { useMutation } from "@/lib/apollo/hooks"
import { INCREMENT_EVENT_VIEW_MUTATION } from "@/lib/graphql/operations"

export default function EventViewTracker({ slug }: { slug: string }) {
  const [incrementEventView] = useMutation(INCREMENT_EVENT_VIEW_MUTATION)

  useEffect(() => {
    incrementEventView({ variables: { slug } }).catch(console.error)
  }, [slug, incrementEventView])

  return null
}
