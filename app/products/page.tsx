import ProductsListing from "@/components/ProductsListing"
import { fetchPostsList, categorySlugOf } from "@/lib/graphql/posts"

export default async function ProductsPage() {
  const posts = await fetchPostsList(50)

  const productPosts = posts.filter(
    (p) => categorySlugOf(p) === "products"
  )

  return (
    <main className="bg-white">
      <ProductsListing posts={productPosts} />
    </main>
  )
}
