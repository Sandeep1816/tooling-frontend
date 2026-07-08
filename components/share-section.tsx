"use client"

import Link from "next/link"
import { useMutation } from "@/lib/apollo/hooks"
import { INCREMENT_POST_SHARE_MUTATION } from "@/lib/graphql/operations"

type SharePost = {
  title: string
  slug: string
  youtubeUrl?: string
  facebookUrl?: string
  linkedinUrl?: string
  twitterUrl?: string
  email?: string
  whatsappNumber?: string
}

type Props = {
  post: SharePost
}

export default function ShareSection({ post }: Props) {
  const [incrementPostShare] = useMutation(INCREMENT_POST_SHARE_MUTATION)

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : ""

  const shareText = encodeURIComponent(post.title)

  const trackShare = async () => {
    try {
      await incrementPostShare({ variables: { slug: post.slug } })
    } catch (err) {
      console.error("Failed to track share")
    }
  }

  const shareButtons = [
    {
      icon: "ri-facebook-fill",
      label: "Facebook",
      href:
        post.facebookUrl ||
        `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
    },
    {
      icon: "ri-linkedin-fill",
      label: "LinkedIn",
      href:
        post.linkedinUrl ||
        `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
    },
    {
      icon: "ri-twitter-x-fill",
      label: "Twitter",
      href:
        post.twitterUrl ||
        `https://twitter.com/intent/tweet?url=${pageUrl}&text=${shareText}`,
    },
    {
      icon: "ri-mail-fill",
      label: "Email",
      href:
        post.email
          ? `mailto:${post.email}?subject=${shareText}&body=${pageUrl}`
          : `mailto:?subject=${shareText}&body=${pageUrl}`,
    },
    {
      icon: "ri-whatsapp-fill",
      label: "WhatsApp",
      href:
        post.whatsappNumber
          ? `https://wa.me/${post.whatsappNumber}?text=${shareText}%20${pageUrl}`
          : `https://wa.me/?text=${shareText}%20${pageUrl}`,
    },
  ]

  return (
    <div className="flex items-center gap-3 mt-10 border-t border-gray-200 pt-4">
      <span className="text-gray-600 font-semibold uppercase text-xs tracking-widest">
        Share:
      </span>

      <div className="flex gap-2">
        {shareButtons.map((btn) => (
          <Link
            key={btn.label}
            href={btn.href}
            target="_blank"
            onClick={trackShare}   
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#0077b6] hover:text-white transition"
            title={btn.label}
          >
            <i className={`${btn.icon} text-lg`}></i>
          </Link>
        ))}

        {/* Print (no share tracking) */}
        <button
          onClick={() => window.print()}
          className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-[#0077b6] hover:text-white transition"
          title="Print"
        >
          <i className="ri-printer-fill text-lg"></i>
        </button>
      </div>
    </div>
  )
}
