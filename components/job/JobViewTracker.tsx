"use client"

import { useEffect } from "react"
import { useMutation } from "@/lib/apollo/hooks"
import { INCREMENT_JOB_VIEW_MUTATION } from "@/lib/graphql/operations"

export default function JobViewTracker({ slug }: { slug: string }) {
  const [incrementJobView] = useMutation(INCREMENT_JOB_VIEW_MUTATION)

  useEffect(() => {
    incrementJobView({ variables: { slug } }).catch(console.error)
  }, [slug, incrementJobView])

  return null
}
