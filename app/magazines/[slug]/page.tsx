import FlipBookViewer from "@/components/FlipBookViewer"
import DownloadSection from "@/components/magazine/DownloadSection"
import { graphqlRequest } from "@/lib/graphql/server"
import { MAGAZINE_BY_SLUG_QUERY } from "@/lib/graphql/queries"

type Props = {
  params: Promise<{
    slug: string
  }>
}

async function getMagazine(slug: string) {
  const data = await graphqlRequest<{
    magazine: {
      id: string
      title: string
      slug: string
      description?: string
      pdfUrl?: string
      flipbookPages?: string[]
    }
  }>(MAGAZINE_BY_SLUG_QUERY, { slug })

  return data.magazine
}

export default async function SingleMagazinePage({ params }: Props) {
  const { slug } = await params
  const magazine = await getMagazine(slug)

  return (
    <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-[15px] py-12">
      <FlipBookViewer pages={magazine.flipbookPages || []} />

      <h1 className="text-4xl font-bold mt-12 mb-6 text-[#003B5C]">
        {magazine.title}
      </h1>

      {magazine.description && (
        <div
          className="prose max-w-none mb-10"
          dangerouslySetInnerHTML={{ __html: magazine.description }}
        />
      )}

      {magazine.pdfUrl && (
        <div className="mt-12">
          <DownloadSection magazineId={magazine.id} />
        </div>
      )}
    </div>
  )
}
