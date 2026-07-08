"use client"

import { useEffect } from "react"
import { useMutation } from "@/lib/apollo/hooks"
import { INCREMENT_POST_VIEW_MUTATION } from "@/lib/graphql/operations"

export default function PostViewCounter({ slug }: { slug: string }) {
  const [incrementPostView] = useMutation(INCREMENT_POST_VIEW_MUTATION)

  useEffect(() => {
    if (!slug) return

    const key = `viewed-${slug}`

    if (!sessionStorage.getItem(key)) {
      incrementPostView({ variables: { slug } }).catch(console.error)
      sessionStorage.setItem(key, "true")
    }
  }, [slug, incrementPostView])

  return null
}
