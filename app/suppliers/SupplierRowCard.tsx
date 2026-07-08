"use client"

import Link from "next/link"
import Image from "next/image"
import { useMutation } from "@/lib/apollo/hooks"
import {
  LucideFacebook,
  LucideLinkedin,
  LucideTwitter,
  LucideYoutube,
  LucideEye,
} from "lucide-react"
import { TRACK_SUPPLIER_CONNECTION_MUTATION } from "@/lib/graphql/operations"

/* ---------------- HELPER ---------------- */
function stripHtml(html: string) {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()
}

/* ---------------- COMPONENT ---------------- */
export default function SupplierRowCard({ supplier }: any) {
  const social = supplier.socialLinks || {}
  const views = supplier.views ?? 0
  const [trackConnectionMutation] = useMutation(TRACK_SUPPLIER_CONNECTION_MUTATION)

  const trackConnection = async () => {
    try {
      await trackConnectionMutation({ variables: { id: supplier.id } })
    } catch (err) {
      console.error("Failed to track connection", err)
    }
  }

  return (
    <div className="bg-white border border-[#dee2e6] rounded-md p-4 sm:p-6 flex flex-col lg:flex-row gap-6">

      {/* LOGO */}
      <div className="w-full lg:w-40 flex items-center justify-center shrink-0">
        {supplier.logoUrl ? (
          <Image
            src={supplier.logoUrl}
            alt={supplier.name}
            width={160}
            height={90}
            className="object-contain max-h-24"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Logo</div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TITLE */}
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          {supplier.name}
        </h2>

        {supplier.location && (
          <p className="text-sm text-gray-500 mt-1">
            {supplier.location}
          </p>
        )}

        {/* DESCRIPTION */}
        <p className="text-sm text-gray-700 mt-3 line-clamp-4">
          {stripHtml(supplier.description)}
        </p>

        {/* FOOTER */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-end gap-4">

            {/* LEFT INFO */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">

              {/* VIEWS */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <LucideEye className="w-4 h-4" />
                <span>{views.toLocaleString()} views</span>
              </div>

              {/* VIDEO */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Video
                </span>
                <span className="w-9 h-9 flex items-center justify-center border border-gray-300">
                  <LucideYoutube className="w-5 h-5 text-red-600" />
                </span>
              </div>

              {/* SOCIAL */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Connect
                </span>

                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackConnection}
                    className="w-9 h-9 bg-[#3b5998] flex items-center justify-center"
                  >
                    <LucideFacebook className="w-4 h-4 text-white" />
                  </a>
                )}

                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackConnection}
                    className="w-9 h-9 bg-[#0077b5] flex items-center justify-center"
                  >
                    <LucideLinkedin className="w-4 h-4 text-white" />
                  </a>
                )}

                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackConnection}
                    className="w-9 h-9 bg-black flex items-center justify-center"
                  >
                    <LucideTwitter className="w-4 h-4 text-white" />
                  </a>
                )}

                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackConnection}
                    className="w-9 h-9 bg-red-600 flex items-center justify-center"
                  >
                    <LucideYoutube className="w-4 h-4 text-white" />
                  </a>
                )}
              </div>
            </div>

            {/* CTA */}
            <Link
              href={`/suppliers/${supplier.slug}`}
              className="lg:ml-auto w-full lg:w-auto text-center bg-red-700 text-white px-6 py-3 text-sm font-semibold uppercase hover:bg-red-800 transition"
            >
              View Showroom
            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}
