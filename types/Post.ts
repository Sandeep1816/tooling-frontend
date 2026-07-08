export type Author = {
  id: string | number
  name: string
  bio?: string | null
  avatarUrl?: string | null
}

export type Category = {
  id: string | number
  name: string
  slug: string
}

export type Post = {
  id: string | number
  title: string
  slug: string
  excerpt?: string | null
  badge?: string | null
  content: string

  imageUrl?: string | null
  youtubeUrl?: string | null   
  createdAt?: string
  updatedAt?: string
  publishedAt?: string | null

  views?: number | null

  author?: Author
  category?: Category
  Company?: {
    id: string | number
    name: string
    slug?: string
    logoUrl?: string | null
  }
}