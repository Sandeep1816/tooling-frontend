"use client"

import { useMutation } from "@/lib/apollo/hooks"
import { TRACK_SUPPLIER_CONNECTION_MUTATION } from "@/lib/graphql/operations"

export default function SocialLinksTracker({
  supplierId,
  children,
}: {
  supplierId: string
  children: React.ReactNode
}) {
  const [trackConnection] = useMutation(TRACK_SUPPLIER_CONNECTION_MUTATION)

  const track = async () => {
    try {
      await trackConnection({ variables: { id: supplierId } })
    } catch (err) {
      console.error("Failed to track connection", err)
    }
  }

  return (
    <div onClick={track} className="inline-flex">
      {children}
    </div>
  )
}
