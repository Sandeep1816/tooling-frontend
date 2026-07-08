import CompanyArticlesCarousel from "@/components/CompanyArticlesCarousel"
import VideoGallery from "@/components/VideoGallery"
import SocialLinksTracker from "@/components/SocialLinksTracker"
import {
  LucideFacebook,
  LucideLinkedin,
  LucideTwitter,
  LucideYoutube,
  Globe,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"
import ClaimCompanyBanner from "@/components/ClaimCompanyBanner"
import { graphqlRequest } from "@/lib/graphql/server"
import { SUPPLIER_BY_SLUG_QUERY, POSTS_LIST_QUERY } from "@/lib/graphql/queries"

type Article = {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  imageUrl?: string | null
  publishedAt: string
}

type Supplier = {
  id: string
  companyId?: string | null
  name: string
  slug: string
  description: string
  website?: string
  logoUrl?: string
  coverImageUrl?: string
  phoneNumber?: string
  email?: string
  tradeNames?: string[]
  videoGallery?: string[]
  socialLinks?: {
    facebook?: string
    linkedin?: string
    twitter?: string
    youtube?: string
  }
  company?: {
    id: string
    name: string
    location?: string
    website?: string
    industry?: { name: string }
  }
}

export default async function SupplierShowroomPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let supplier: Supplier | null = null

  try {
    const data = await graphqlRequest<{ supplier: Supplier }>(
      SUPPLIER_BY_SLUG_QUERY,
      { slug }
    )
    supplier = data.supplier
  } catch {
    supplier = null
  }

  if (!supplier) {
    return (
      <div className="p-10 text-center text-gray-600">Supplier not found</div>
    )
  }

  let articles: Article[] = []
  if (supplier.companyId) {
    try {
      const postsData = await graphqlRequest<{
        posts: {
          edges: { node: Article }[]
        }
      }>(POSTS_LIST_QUERY, {
        first: 20,
        filter: { companyId: supplier.companyId, categorySlug: "articles" },
      })
      articles = postsData.posts.edges.map((e) => e.node)
    } catch {
      articles = []
    }
  }

  const social = (supplier.socialLinks || {}) as Supplier["socialLinks"]
  const websiteLink = supplier.website || supplier.company?.website
  const tradeNames = Array.isArray(supplier.tradeNames)
    ? supplier.tradeNames
    : supplier.tradeNames
    ? [String(supplier.tradeNames)]
    : []
  const videos = Array.isArray(supplier.videoGallery)
    ? supplier.videoGallery
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-[300px] bg-black">
        {supplier.coverImageUrl && (
          <img
            src={supplier.coverImageUrl}
            alt={supplier.name}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 -mt-36">
        <div className="bg-white rounded-lg shadow p-10 border-t-4 border-red-700">
          <h1 className="text-3xl font-bold text-center text-[#0b3954]">
            {supplier.name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mt-12">
            <aside className="space-y-8 md:col-span-1">
              {supplier.logoUrl && (
                <img
                  src={supplier.logoUrl}
                  alt={supplier.name}
                  className="w-full max-w-[160px] object-contain"
                />
              )}

              {supplier.company?.location && (
                <p className="flex items-center justify-center gap-2 text-gray-500 mt-2">
                  <MapPin size={16} />
                  {supplier.company.location}
                </p>
              )}

              <div className="text-sm space-y-3">
                {tradeNames.length > 0 && (
                  <p className="text-gray-600">
                    <strong>Trade Names:</strong> {tradeNames.join(", ")}
                  </p>
                )}

                {supplier.phoneNumber && (
                  <p className="flex items-center gap-2">
                    <Phone size={14} />
                    {supplier.phoneNumber}
                  </p>
                )}

                {supplier.email && (
                  <p className="flex items-center gap-2">
                    <Mail size={14} />
                    {supplier.email}
                  </p>
                )}

                {websiteLink && (
                  <p className="flex items-center gap-2">
                    <Globe size={14} />
                    <a
                      href={websiteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {websiteLink}
                    </a>
                  </p>
                )}
              </div>

              {(social?.facebook ||
                social?.linkedin ||
                social?.twitter ||
                social?.youtube) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                    Connect
                  </h4>
                  <SocialLinksTracker supplierId={supplier.id}>
                    <div className="flex gap-4">
                      {social.facebook && (
                        <a href={social.facebook} target="_blank" rel="noopener noreferrer">
                          <LucideFacebook className="w-5 h-5 text-[#3b5998]" />
                        </a>
                      )}
                      {social.linkedin && (
                        <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
                          <LucideLinkedin className="w-5 h-5 text-[#0077b5]" />
                        </a>
                      )}
                      {social.twitter && (
                        <a href={social.twitter} target="_blank" rel="noopener noreferrer">
                          <LucideTwitter className="w-5 h-5" />
                        </a>
                      )}
                      {social.youtube && (
                        <a href={social.youtube} target="_blank" rel="noopener noreferrer">
                          <LucideYoutube className="w-5 h-5 text-red-600" />
                        </a>
                      )}
                    </div>
                  </SocialLinksTracker>
                </div>
              )}
            </aside>

            <section className="md:col-span-2">
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: supplier.description }}
              />
            </section>
          </div>

          <ClaimCompanyBanner />

          {videos.length > 0 && (
            <>
              <hr className="my-12" />
              <VideoGallery videos={videos} />
            </>
          )}

          {articles.length > 0 && (
            <>
              <hr className="my-12" />
              <CompanyArticlesCarousel articles={articles} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
