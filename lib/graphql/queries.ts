export const POSTS_LIST_QUERY = `
  query Posts($first: Int, $page: Int, $filter: PostsFilterInput) {
    posts(
      first: $first
      page: $page
      filter: $filter
      sort: { field: PUBLISHED_AT, order: DESC }
    ) {
      totalCount
      edges {
        node {
          id
          title
          slug
          excerpt
          badge
          imageUrl
          youtubeUrl
          views
          publishedAt
          createdAt
          updatedAt
          author { id name bio avatarUrl }
          category { id name slug }
          company { id name slug logoUrl }
        }
      }
    }
  }
`;

export const POST_BY_SLUG_QUERY = `
  query PostBySlug($slug: String!) {
    post(slug: $slug) {
      id
      title
      slug
      excerpt
      badge
      content
      imageUrl
      youtubeUrl
      views
      publishedAt
      createdAt
      updatedAt
      author { id name bio avatarUrl }
      category { id name slug }
      company { id name slug logoUrl }
    }
  }
`;

export const POST_BY_ID_QUERY = `
  query PostById($id: ID!) {
    postById(id: $id) {
      id
      title
      slug
      badge
      excerpt
      content
      imageUrl
      facebookUrl
      linkedinUrl
      twitterUrl
      youtubeUrl
      email
      whatsappNumber
      authorId
      categoryId
      companyId
      author { id name }
      category { id name slug }
    }
  }
`;

export const CATEGORIES_QUERY = `
  query Categories {
    categories { id name slug }
  }
`;

export const AUTHORS_QUERY = `
  query Authors {
    authors { id name bio avatarUrl }
  }
`;

export const JOB_POSTING_ELIGIBILITY_QUERY = `
  query JobPostingEligibility {
    jobPostingEligibility {
      canPost
      plan
      activeJobs
      effectiveLimit
      remaining
      message
    }
  }
`;

export const EVENTS_LIST_QUERY = `
  query Events($filter: EventsFilterInput) {
    events(filter: $filter) {
      id
      title
      slug
      logoUrl
      bannerUrl
      startDate
      endDate
      location
      description
      registerUrl
    }
  }
`;

export const EVENT_BY_SLUG_QUERY = `
  query EventBySlug($slug: String!) {
    event(slug: $slug) {
      id
      title
      slug
      logoUrl
      bannerUrl
      startDate
      endDate
      location
      description
      websiteUrl
      calendarUrl
      registerUrl
    }
  }
`;

export const SUPPLIERS_LIST_QUERY = `
  query Suppliers($filter: SuppliersFilterInput, $page: Int, $limit: Int, $sort: String) {
    suppliers(filter: $filter, page: $page, limit: $limit, sort: $sort) {
      items {
        id
        name
        slug
        description
        logoUrl
        company { location name }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const SUPPLIER_BY_SLUG_QUERY = `
  query SupplierBySlug($slug: String!) {
    supplier(slug: $slug) {
      id
      companyId
      name
      slug
      description
      website
      logoUrl
      coverImageUrl
      phoneNumber
      email
      tradeNames
      videoGallery
      socialLinks
      company {
        id
        name
        location
        website
        industry { name }
      }
    }
  }
`;

export const SUPPLIERS_HEADER_QUERY = `
  query SuppliersHeader {
    suppliers(limit: 4, sort: "popular") {
      items {
        id
        name
        slug
        description
        logoUrl
      }
    }
  }
`;

export const INDUSTRIES_LIST_QUERY = `
  query Industries {
    industries {
      id
      name
      slug
      parentId
    }
  }
`;

export const INDUSTRY_CHILDREN_LIST_QUERY = `
  query IndustryChildren($parentId: ID!) {
    industryChildren(parentId: $parentId) {
      id
      name
      slug
      parentId
    }
  }
`;

export const PRODUCT_LISTING_ELIGIBILITY_QUERY = `
  query ProductListingEligibility {
    productListingEligibility {
      canAdd
      plan
      activeListings
      effectiveLimit
      remaining
      message
    }
  }
`;

export const ARTICLE_POSTING_ELIGIBILITY_QUERY = `
  query ArticlePostingEligibility {
    articlePostingEligibility {
      canCreate
      plan
      planLabel
      articlesThisYear
      effectiveLimit
      remaining
      isUnlimited
      periodLabel
      upgradeRequired
      message
    }
  }
`;

export const MAGAZINES_LIST_QUERY = `
  query Magazines {
    magazines {
      id
      title
      slug
      description
      coverImageUrl
      pdfUrl
      flipbookPages
      createdAt
      coverStory {
        id
        title
        slug
        shortDescription
        badge
        coverImageUrl
      }
    }
  }
`;

export const MAGAZINE_BY_SLUG_QUERY = `
  query MagazineBySlug($slug: String!) {
    magazine(slug: $slug) {
      id
      title
      slug
      description
      coverImageUrl
      pdfUrl
      flipbookPages
    }
  }
`;

export const COVER_STORY_BY_SLUG_QUERY = `
  query CoverStoryBySlug($slug: String!) {
    coverStory(slug: $slug) {
      id
      title
      slug
      shortDescription
      keyCategories
      fullDescription
      badge
      coverImageUrl
      createdAt
      author {
        id
        name
        profileImageUrl
        designation
      }
    }
  }
`;

export const BANNERS_BY_PLACEMENT_QUERY = `
  query BannersByPlacement($placement: BannerPlacement!) {
    banners(placement: $placement) {
      id
      title
      imageUrl
      targetUrl
      placement
      status
      position
    }
  }
`;

export const ADMIN_BANNERS_QUERY = `
  query AdminBanners {
    adminBanners {
      id
      title
      imageUrl
      targetUrl
      placement
      status
      position
      clicks
      impressions
      startDate
      endDate
      createdAt
    }
  }
`;

export const BANNER_BY_ID_QUERY = `
  query BannerById($id: ID!) {
    bannerById(id: $id) {
      id
      title
      imageUrl
      targetUrl
      placement
      status
      position
      startDate
      endDate
    }
  }
`;

export const USER_BY_USERNAME_QUERY = `
  query UserByUsername($username: String!) {
    userByUsername(username: $username) {
      id
      email
      role
      username
      fullName
      headline
      about
      location
      avatarUrl
      websiteUrl
      isOnboarded
      companyId
      company {
        id
        name
        slug
        tagline
        logoUrl
      }
    }
  }
`;
