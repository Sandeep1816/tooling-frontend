import Image from "next/image"
import { notFound } from "next/navigation"
import { graphqlRequest } from "@/lib/graphql/server"
import { POST_BY_SLUG_QUERY } from "@/lib/graphql/queries"

type Company = {
  id: number
  name: string
  slug: string
}

type Article = {
  id: number
  title: string
  slug: string
  content: string
  imageUrl?: string | null
  publishedAt: string
  company?: Company | null
}

async function getArticle(slug: string): Promise<Article> {
  try {
    const data = await graphqlRequest<{ post: Article | null }>(
      POST_BY_SLUG_QUERY,
      { slug }
    )

    if (!data.post) {
      notFound()
    }

    return data.post
  } catch {
    notFound()
  }
}

export default async function ArticleSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const article = await getArticle(slug)

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {article.title}
      </h1>

      {article.company && (
        <p className="text-sm text-gray-500 mb-6">
          Posted by{" "}
          <span className="font-semibold text-gray-700">
            {article.company.name}
          </span>
        </p>
      )}

      {article.imageUrl && (
        <div className="relative w-full h-[380px] mb-8 rounded-xl overflow-hidden">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      <div className="mt-10 text-sm text-gray-400">
        Published on{" "}
        {new Date(article.publishedAt).toLocaleDateString()}
      </div>
    </main>
  )
}
