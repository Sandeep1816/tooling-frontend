import { gql } from "@apollo/client";

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
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
    emailVerified
    createdAt
    updatedAt
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      message
      success
    }
  }
`;

export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOtp($input: VerifyOtpInput!) {
    verifyOtp(input: $input) {
      message
      success
    }
  }
`;

export const RESEND_OTP_MUTATION = gql`
  mutation ResendOtp($input: ResendOtpInput!) {
    resendOtp(input: $input) {
      message
      success
    }
  }
`;

export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    forgotPassword(input: $input) {
      message
      success
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      message
      success
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout($refreshToken: String) {
    logout(refreshToken: $refreshToken) {
      message
      success
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const USERS_QUERY = gql`
  query Users(
    $first: Int
    $after: String
    $filter: UsersFilterInput
    $sort: UsersSortInput
  ) {
    users(first: $first, after: $after, filter: $filter, sort: $sort) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...UserFields
        }
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const CREATE_RECRUITER_MUTATION = gql`
  mutation CreateRecruiter($input: CreateRecruiterInput!) {
    createRecruiter(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      message
      success
    }
  }
`;

export const CATEGORY_FRAGMENT = gql`
  fragment CategoryFields on Category {
    id
    name
    slug
  }
`;

export const AUTHOR_FRAGMENT = gql`
  fragment AuthorFields on Author {
    id
    name
    bio
    avatarUrl
  }
`;

export const POST_CARD_FRAGMENT = gql`
  fragment PostCardFields on Post {
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
    author {
      ...AuthorFields
    }
    category {
      ...CategoryFields
    }
    company {
      id
      name
      slug
      logoUrl
    }
  }
  ${AUTHOR_FRAGMENT}
  ${CATEGORY_FRAGMENT}
`;

export const POST_DETAIL_FRAGMENT = gql`
  fragment PostDetailFields on Post {
    ...PostCardFields
    content
    facebookUrl
    linkedinUrl
    twitterUrl
    email
    whatsappNumber
    status
    shares
  }
  ${POST_CARD_FRAGMENT}
`;

export const POSTS_QUERY = gql`
  query Posts(
    $first: Int
    $after: String
    $page: Int
    $filter: PostsFilterInput
    $sort: PostsSortInput
  ) {
    posts(
      first: $first
      after: $after
      page: $page
      filter: $filter
      sort: $sort
    ) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
      edges {
        cursor
        node {
          ...PostCardFields
        }
      }
    }
  }
  ${POST_CARD_FRAGMENT}
`;

export const POST_BY_SLUG_QUERY = gql`
  query PostBySlug($slug: String!) {
    post(slug: $slug) {
      ...PostDetailFields
      comments {
        id
        name
        email
        content
        createdAt
      }
    }
  }
  ${POST_DETAIL_FRAGMENT}
`;

export const POST_BY_ID_QUERY = gql`
  query PostById($id: ID!) {
    postById(id: $id) {
      ...PostDetailFields
      authorId
      categoryId
      companyId
    }
  }
  ${POST_DETAIL_FRAGMENT}
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      ...CategoryFields
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const AUTHORS_QUERY = gql`
  query Authors {
    authors {
      ...AuthorFields
    }
  }
  ${AUTHOR_FRAGMENT}
`;

export const CREATE_POST_MUTATION = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostDetailFields
    }
  }
  ${POST_DETAIL_FRAGMENT}
`;

export const UPDATE_POST_MUTATION = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      ...PostDetailFields
    }
  }
  ${POST_DETAIL_FRAGMENT}
`;

export const DELETE_POST_MUTATION = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id) {
      message
      success
    }
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      ...CategoryFields
    }
  }
  ${CATEGORY_FRAGMENT}
`;

export const CREATE_AUTHOR_MUTATION = gql`
  mutation CreateAuthor($input: CreateAuthorInput!) {
    createAuthor(input: $input) {
      ...AuthorFields
    }
  }
  ${AUTHOR_FRAGMENT}
`;

export const COMPANY_FRAGMENT = gql`
  fragment CompanyFields on Company {
    id
    name
    slug
    tagline
    description
    location
    address
    companySize
    website
    logoUrl
    coverImageUrl
    isVerified
    industryId
    followerCount
    isFollowing
    createdAt
    updatedAt
    industry {
      id
      name
      slug
    }
    jobs {
      id
      title
      slug
      location
      employmentType
      isRemote
      createdAt
    }
  }
`;

export const COMPANY_PERSON_FRAGMENT = gql`
  fragment CompanyPersonFields on CompanyPerson {
    id
    username
    fullName
    headline
    location
    avatarUrl
    role
    relation
    followingSince
  }
`;

export const COMPANIES_QUERY = gql`
  query Companies(
    $first: Int
    $after: String
    $page: Int
    $filter: CompaniesFilterInput
    $sort: CompaniesSortInput
  ) {
    companies(
      first: $first
      after: $after
      page: $page
      filter: $filter
      sort: $sort
    ) {
      totalCount
      edges {
        cursor
        node {
          ...CompanyFields
        }
      }
    }
  }
  ${COMPANY_FRAGMENT}
`;

export const COMPANY_BY_SLUG_QUERY = gql`
  query CompanyBySlug($slug: String!) {
    company(slug: $slug) {
      ...CompanyFields
      people {
        ...CompanyPersonFields
      }
    }
  }
  ${COMPANY_FRAGMENT}
  ${COMPANY_PERSON_FRAGMENT}
`;

export const COMPANY_PEOPLE_QUERY = gql`
  query CompanyPeople($slug: String!) {
    company(slug: $slug) {
      ...CompanyFields
      people {
        ...CompanyPersonFields
      }
    }
  }
  ${COMPANY_FRAGMENT}
  ${COMPANY_PERSON_FRAGMENT}
`;

export const CREATE_COMPANY_MUTATION = gql`
  mutation CreateCompany($input: CreateCompanyInput!) {
    createCompany(input: $input) {
      ...CompanyFields
    }
  }
  ${COMPANY_FRAGMENT}
`;

export const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
    updateCompany(id: $id, input: $input) {
      ...CompanyFields
    }
  }
  ${COMPANY_FRAGMENT}
`;

export const DELETE_COMPANY_MUTATION = gql`
  mutation DeleteCompany($id: ID!) {
    deleteCompany(id: $id) {
      message
      success
    }
  }
`;

export const FOLLOW_COMPANY_MUTATION = gql`
  mutation FollowCompany($companyId: ID!) {
    followCompany(companyId: $companyId) {
      message
      success
    }
  }
`;

export const UNFOLLOW_COMPANY_MUTATION = gql`
  mutation UnfollowCompany($companyId: ID!) {
    unfollowCompany(companyId: $companyId) {
      message
      success
    }
  }
`;

export const INDUSTRIES_QUERY = gql`
  query Industries {
    industries {
      id
      name
      slug
      parentId
    }
  }
`;

export const INDUSTRY_CHILDREN_QUERY = gql`
  query IndustryChildren($parentId: ID!) {
    industryChildren(parentId: $parentId) {
      id
      name
      slug
      parentId
    }
  }
`;

export const JOB_CARD_FRAGMENT = gql`
  fragment JobCardFields on Job {
    id
    title
    slug
    description
    location
    employmentType
    experience
    salaryRange
    isRemote
    isActive
    views
    companyName
    isExternal
    applyUrl
    applicationCount
    createdAt
    company {
      id
      name
      slug
      logoUrl
    }
  }
`;

export const JOB_DETAIL_FRAGMENT = gql`
  fragment JobDetailFields on Job {
    ...JobCardFields
    postedById
    isSaved
    updatedAt
  }
  ${JOB_CARD_FRAGMENT}
`;

export const JOBS_QUERY = gql`
  query Jobs(
    $first: Int
    $after: String
    $page: Int
    $filter: JobsFilterInput
    $sort: JobsSortInput
  ) {
    jobs(
      first: $first
      after: $after
      page: $page
      filter: $filter
      sort: $sort
    ) {
      totalCount
      edges {
        cursor
        node {
          ...JobCardFields
        }
      }
    }
  }
  ${JOB_CARD_FRAGMENT}
`;

export const JOB_BY_SLUG_QUERY = gql`
  query JobBySlug($slug: String!) {
    job(slug: $slug) {
      ...JobDetailFields
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const JOB_BY_ID_QUERY = gql`
  query JobById($id: ID!) {
    jobById(id: $id) {
      ...JobDetailFields
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const MY_RECRUITER_JOBS_QUERY = gql`
  query MyRecruiterJobs {
    myRecruiterJobs {
      ...JobDetailFields
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const JOB_POSTING_ELIGIBILITY_QUERY = gql`
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

export const SAVED_JOBS_QUERY = gql`
  query SavedJobs {
    savedJobs {
      id
      jobId
      createdAt
      job {
        ...JobCardFields
      }
    }
  }
  ${JOB_CARD_FRAGMENT}
`;

export const JOB_SAVE_STATUS_QUERY = gql`
  query JobSaveStatus($jobId: ID!) {
    jobSaveStatus(jobId: $jobId)
  }
`;

export const MY_APPLICATIONS_QUERY = gql`
  query MyApplications {
    myApplications {
      id
      status
      createdAt
      job {
        title
        slug
        location
        company {
          name
          slug
        }
        companyName
      }
    }
  }
`;

export const JOB_APPLICATIONS_QUERY = gql`
  query JobApplications($jobId: ID!) {
    jobApplications(jobId: $jobId) {
      id
      resumeUrl
      coverNote
      status
      createdAt
      applicant {
        id
        fullName
        email
        headline
      }
      job {
        title
        location
        employmentType
        company {
          name
        }
        companyName
      }
    }
  }
`;

export const CREATE_JOB_MUTATION = gql`
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      ...JobDetailFields
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const UPDATE_JOB_MUTATION = gql`
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      ...JobDetailFields
    }
  }
  ${JOB_DETAIL_FRAGMENT}
`;

export const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id) {
      message
      success
    }
  }
`;

export const INCREMENT_JOB_VIEW_MUTATION = gql`
  mutation IncrementJobView($slug: String!) {
    incrementJobView(slug: $slug) {
      id
      slug
      views
    }
  }
`;

export const SAVE_JOB_MUTATION = gql`
  mutation SaveJob($jobId: ID!) {
    saveJob(jobId: $jobId) {
      message
      success
    }
  }
`;

export const UNSAVE_JOB_MUTATION = gql`
  mutation UnsaveJob($jobId: ID!) {
    unsaveJob(jobId: $jobId) {
      message
      success
    }
  }
`;

export const APPLY_JOB_MUTATION = gql`
  mutation ApplyJob($input: ApplyJobInput!) {
    applyJob(input: $input) {
      id
      status
      createdAt
    }
  }
`;

export const UPDATE_APPLICATION_STATUS_MUTATION = gql`
  mutation UpdateApplicationStatus($input: UpdateApplicationStatusInput!) {
    updateApplicationStatus(input: $input) {
      id
      status
    }
  }
`;

export const APPLICATION_QUERY = gql`
  query Application($id: ID!) {
    application(id: $id) {
      id
      resumeUrl
      coverNote
      status
      createdAt
      applicant {
        id
        fullName
        email
        headline
      }
      job {
        title
        location
        employmentType
        company {
          name
        }
        companyName
      }
    }
  }
`;

export const JOB_ALERTS_QUERY = gql`
  query JobAlerts {
    jobAlerts {
      id
      name
      keywords
      location
      employmentType
      isRemote
      isActive
      matchCount
      createdAt
    }
  }
`;

export const JOB_ALERT_MATCHES_QUERY = gql`
  query JobAlertMatches($alertId: ID!) {
    jobAlertMatches(alertId: $alertId) {
      ...JobCardFields
    }
  }
  ${JOB_CARD_FRAGMENT}
`;

export const CREATE_JOB_ALERT_MUTATION = gql`
  mutation CreateJobAlert($input: CreateJobAlertInput!) {
    createJobAlert(input: $input) {
      id
      name
      keywords
      location
      employmentType
      isRemote
      isActive
      matchCount
      createdAt
    }
  }
`;

export const UPDATE_JOB_ALERT_MUTATION = gql`
  mutation UpdateJobAlert($id: ID!, $input: UpdateJobAlertInput!) {
    updateJobAlert(id: $id, input: $input) {
      id
      isActive
    }
  }
`;

export const DELETE_JOB_ALERT_MUTATION = gql`
  mutation DeleteJobAlert($id: ID!) {
    deleteJobAlert(id: $id) {
      message
      success
    }
  }
`;

export const EVENT_FRAGMENT = gql`
  fragment EventFields on Event {
    id
    title
    slug
    logoUrl
    bannerUrl
    startDate
    endDate
    description
    websiteUrl
    registerUrl
    location
    calendarUrl
    status
    views
    publishedAt
    createdAt
    updatedAt
    registrationCount
  }
`;

export const EVENTS_QUERY = gql`
  query Events($filter: EventsFilterInput) {
    events(filter: $filter) {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

export const ADMIN_EVENTS_QUERY = gql`
  query AdminEvents {
    adminEvents {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

export const EVENT_BY_SLUG_QUERY = gql`
  query EventBySlug($slug: String!) {
    event(slug: $slug) {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

export const EVENT_BY_ID_QUERY = gql`
  query EventById($id: ID!) {
    eventById(id: $id) {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

export const EVENT_REGISTRATIONS_QUERY = gql`
  query EventRegistrations($eventId: ID!) {
    eventRegistrations(eventId: $eventId) {
      id
      fullName
      email
      phone
      companyName
      jobTitle
      country
      createdAt
    }
  }
`;

export const CREATE_EVENT_MUTATION = gql`
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

export const UPDATE_EVENT_MUTATION = gql`
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      ...EventFields
    }
  }
  ${EVENT_FRAGMENT}
`;

export const PUBLISH_EVENT_MUTATION = gql`
  mutation PublishEvent($id: ID!) {
    publishEvent(id: $id) {
      id
      status
      publishedAt
    }
  }
`;

export const INCREMENT_EVENT_VIEW_MUTATION = gql`
  mutation IncrementEventView($slug: String!) {
    incrementEventView(slug: $slug) {
      id
      slug
      views
    }
  }
`;

export const REGISTER_FOR_EVENT_MUTATION = gql`
  mutation RegisterForEvent($input: RegisterForEventInput!) {
    registerForEvent(input: $input) {
      id
      fullName
      email
      createdAt
    }
  }
`;

export const SUPPLIER_FRAGMENT = gql`
  fragment SupplierFields on SupplierDirectory {
    id
    name
    slug
    companyId
    phoneNumber
    email
    tradeNames
    videoGallery
    description
    website
    logoUrl
    coverImageUrl
    socialLinks
    productSupplies
    status
    isLiveEditable
    views
    connections
    isFeatured
    createdAt
    updatedAt
    company {
      id
      name
      slug
      logoUrl
      location
      website
      industryId
      industry {
        id
        name
        slug
      }
    }
    submittedBy {
      id
      email
      fullName
      username
    }
  }
`;

export const SUPPLIERS_QUERY = gql`
  query Suppliers(
    $filter: SuppliersFilterInput
    $page: Int
    $limit: Int
    $sort: String
  ) {
    suppliers(filter: $filter, page: $page, limit: $limit, sort: $sort) {
      items {
        ...SupplierFields
      }
      total
      page
      limit
      totalPages
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const SUPPLIER_BY_SLUG_QUERY = gql`
  query SupplierBySlug($slug: String!) {
    supplier(slug: $slug) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const SUPPLIER_BY_ID_QUERY = gql`
  query SupplierById($id: ID!) {
    supplierById(id: $id) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const ADMIN_SUPPLIER_DIRECTORIES_QUERY = gql`
  query AdminSupplierDirectories {
    adminSupplierDirectories {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const MY_SUPPLIER_DIRECTORIES_QUERY = gql`
  query MySupplierDirectories {
    mySupplierDirectories {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const PRODUCT_LISTING_ELIGIBILITY_QUERY = gql`
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

export const CREATE_SUPPLIER_DIRECTORY_MUTATION = gql`
  mutation CreateSupplierDirectory($input: CreateSupplierDirectoryInput!) {
    createSupplierDirectory(input: $input) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const ADMIN_CREATE_SUPPLIER_DIRECTORY_MUTATION = gql`
  mutation AdminCreateSupplierDirectory($input: AdminCreateSupplierDirectoryInput!) {
    adminCreateSupplierDirectory(input: $input) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const UPDATE_SUPPLIER_DIRECTORY_MUTATION = gql`
  mutation UpdateSupplierDirectory($id: ID!, $input: UpdateSupplierDirectoryInput!) {
    updateSupplierDirectory(id: $id, input: $input) {
      ...SupplierFields
    }
  }
  ${SUPPLIER_FRAGMENT}
`;

export const APPROVE_SUPPLIER_DIRECTORY_MUTATION = gql`
  mutation ApproveSupplierDirectory($id: ID!) {
    approveSupplierDirectory(id: $id) {
      id
      status
      isLiveEditable
    }
  }
`;

export const REJECT_SUPPLIER_DIRECTORY_MUTATION = gql`
  mutation RejectSupplierDirectory($id: ID!) {
    rejectSupplierDirectory(id: $id) {
      id
      status
    }
  }
`;

export const TRACK_SUPPLIER_CONNECTION_MUTATION = gql`
  mutation TrackSupplierConnection($id: ID!) {
    trackSupplierConnection(id: $id) {
      message
      success
    }
  }
`;

export const MAGAZINE_AUTHOR_FRAGMENT = gql`
  fragment MagazineAuthorFields on MagazineAuthor {
    id
    name
    profileImageUrl
    designation
    linkedinUrl
    createdAt
  }
`;

export const COVER_STORY_FRAGMENT = gql`
  fragment CoverStoryFields on CoverStory {
    id
    title
    slug
    shortDescription
    keyCategories
    imageBrief
    fullDescription
    badge
    coverImageUrl
    slugImageUrls
    authorId
    createdAt
    updatedAt
    author {
      id
      name
      profileImageUrl
      designation
      linkedinUrl
      createdAt
    }
  }
`;

export const MAGAZINE_FRAGMENT = gql`
  fragment MagazineFields on Magazine {
    id
    title
    slug
    description
    coverImageUrl
    pdfUrl
    flipbookPages
    status
    createdById
    authorId
    coverStoryId
    publishedAt
    createdAt
    updatedAt
    author {
      ...MagazineAuthorFields
    }
    coverStory {
      ...CoverStoryFields
    }
  }
  ${MAGAZINE_AUTHOR_FRAGMENT}
  ${COVER_STORY_FRAGMENT}
`;

export const MAGAZINES_QUERY = gql`
  query Magazines {
    magazines {
      ...MagazineFields
    }
  }
  ${MAGAZINE_FRAGMENT}
`;

export const MAGAZINE_BY_SLUG_QUERY = gql`
  query MagazineBySlug($slug: String!) {
    magazine(slug: $slug) {
      ...MagazineFields
    }
  }
  ${MAGAZINE_FRAGMENT}
`;

export const ADMIN_MAGAZINES_QUERY = gql`
  query AdminMagazines {
    adminMagazines {
      ...MagazineFields
    }
  }
  ${MAGAZINE_FRAGMENT}
`;

export const MAGAZINE_AUTHORS_QUERY = gql`
  query MagazineAuthors {
    magazineAuthors {
      ...MagazineAuthorFields
    }
  }
  ${MAGAZINE_AUTHOR_FRAGMENT}
`;

export const COVER_STORIES_QUERY = gql`
  query CoverStories {
    coverStories {
      ...CoverStoryFields
    }
  }
  ${COVER_STORY_FRAGMENT}
`;

export const COVER_STORY_BY_SLUG_QUERY = gql`
  query CoverStoryBySlug($slug: String!) {
    coverStory(slug: $slug) {
      ...CoverStoryFields
    }
  }
  ${COVER_STORY_FRAGMENT}
`;

export const MAGAZINE_CREATION_DATA_QUERY = gql`
  query MagazineCreationData {
    magazineCreationData {
      authors {
        ...MagazineAuthorFields
      }
      coverStories {
        id
        title
        slug
      }
    }
  }
  ${MAGAZINE_AUTHOR_FRAGMENT}
`;

export const MAGAZINE_REGISTRATIONS_QUERY = gql`
  query MagazineRegistrations($magazineId: ID!) {
    magazineRegistrations(magazineId: $magazineId) {
      id
      magazineId
      firstName
      lastName
      email
      companyName
      jobTitle
      country
      createdAt
    }
  }
`;

export const CREATE_MAGAZINE_AUTHOR_MUTATION = gql`
  mutation CreateMagazineAuthor($input: CreateMagazineAuthorInput!) {
    createMagazineAuthor(input: $input) {
      ...MagazineAuthorFields
    }
  }
  ${MAGAZINE_AUTHOR_FRAGMENT}
`;

export const CREATE_COVER_STORY_MUTATION = gql`
  mutation CreateCoverStory($input: CreateCoverStoryInput!) {
    createCoverStory(input: $input) {
      ...CoverStoryFields
    }
  }
  ${COVER_STORY_FRAGMENT}
`;

export const CREATE_MAGAZINE_MUTATION = gql`
  mutation CreateMagazine($input: CreateMagazineInput!) {
    createMagazine(input: $input) {
      ...MagazineFields
    }
  }
  ${MAGAZINE_FRAGMENT}
`;

export const DELETE_MAGAZINE_MUTATION = gql`
  mutation DeleteMagazine($id: ID!) {
    deleteMagazine(id: $id) {
      success
      message
    }
  }
`;

export const REGISTER_FOR_MAGAZINE_MUTATION = gql`
  mutation RegisterForMagazine($input: RegisterForMagazineInput!) {
    registerForMagazine(input: $input) {
      success
      message
    }
  }
`;

export const ADMIN_ANALYTICS_QUERY = gql`
  query AdminAnalytics {
    adminAnalytics {
      overview {
        totalUsers
        totalCompanies
        totalJobs
        activeJobs
        totalApplications
        totalPosts
        totalDirectories
        totalEvents
        totalRevenue
        paidOrders
        pendingOrders
      }
      usersByRole { name key value }
      subscriptionPlans { name key value }
      directoryStatus { name key value }
      postStatus { name key value }
      paymentStatus { name key value }
      applicationStatus { name key value }
      revenueByMonth { month revenue }
      growthByMonth { month users jobs applications }
      recentPurchases {
        id
        packageName
        amount
        status
        createdAt
        user { email fullName }
        company { name }
      }
    }
  }
`;

export const RECRUITER_DASHBOARD_QUERY = gql`
  query RecruiterDashboard {
    recruiterDashboard {
      jobsCount
      applicationsCount
      shortlistedCount
      recentJobs { id title applications }
      articles { id title status createdAt }
      directories { id name slug status isLiveEditable createdAt }
      recentActivity { id type message href color createdAt }
      subscription {
        plan
        planLabel
        displayPlan
        displayPlanLabel
        recruitmentExpiresAt
        expiresAt
        jobPostingCredits
        basePlanLabel
      }
      recentPurchases {
        id
        packageType
        packageId
        packageName
        amount
        status
        createdAt
        expiresAt
      }
      jobPosting {
        canPost
        plan
        activeJobs
        effectiveLimit
        remaining
        message
      }
      articlePosting {
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
      productListings {
        canAdd
        plan
        activeListings
        effectiveLimit
        remaining
        message
      }
      analytics {
        overview {
          totalJobViews
          totalDirectoryViews
          articlesCount
          directoriesCount
        }
        applicationsByStatus { name key value }
        articlesByStatus { name key value }
        directoriesByStatus { name key value }
        applicationsByMonth { month value }
        jobsPostedByMonth { month value }
        engagementByMonth { month applications jobs }
        topJobsByApplications { name applications }
      }
    }
  }
`;

export const RECRUITER_ME_QUERY = gql`
  query RecruiterMe {
    me {
      id
      username
      fullName
      headline
      about
      location
      websiteUrl
      avatarUrl
      companyId
      company {
        id
        name
        tagline
        description
        industryId
        location
        address
        companySize
        website
        logoUrl
        coverImageUrl
      }
    }
  }
`;

export const USER_BY_USERNAME_QUERY = gql`
  query UserByUsername($username: String!) {
    userByUsername(username: $username) {
      ...UserFields
      company {
        id
        name
        slug
        tagline
        logoUrl
      }
    }
  }
  ${USER_FRAGMENT}
`;

export const ARTICLE_POSTING_ELIGIBILITY_QUERY = gql`
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

export const INCREMENT_POST_SHARE_MUTATION = gql`
  mutation IncrementPostShare($slug: String!) {
    incrementPostShare(slug: $slug) {
      message
      success
    }
  }
`;

export const INCREMENT_POST_VIEW_MUTATION = gql`
  mutation IncrementPostView($slug: String!) {
    incrementPostView(slug: $slug) {
      id
      views
    }
  }
`;

export const BANNERS_BY_PLACEMENT_QUERY = gql`
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

export const ADMIN_BANNERS_QUERY = gql`
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

export const BANNER_BY_ID_QUERY = gql`
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

export const CREATE_BANNER_MUTATION = gql`
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
      title
      imageUrl
      placement
      status
    }
  }
`;

export const UPDATE_BANNER_MUTATION = gql`
  mutation UpdateBanner($id: ID!, $input: UpdateBannerInput!) {
    updateBanner(id: $id, input: $input) {
      id
      title
      imageUrl
      placement
      status
    }
  }
`;

export const DELETE_BANNER_MUTATION = gql`
  mutation DeleteBanner($id: ID!) {
    deleteBanner(id: $id) {
      message
      success
    }
  }
`;

export const REORDER_BANNERS_MUTATION = gql`
  mutation ReorderBanners($updates: [ReorderBannerInput!]!) {
    reorderBanners(updates: $updates) {
      message
      success
    }
  }
`;

export const MY_RECRUITER_ARTICLES_QUERY = gql`
  query MyRecruiterArticles {
    myRecruiterArticles {
      id
      title
      slug
      excerpt
      imageUrl
      badge
      status
      createdAt
      views
      shares
      company {
        id
        name
      }
    }
  }
`;

export const CREATE_RECRUITER_ARTICLE_MUTATION = gql`
  mutation CreateRecruiterArticle($input: CreateRecruiterArticleInput!) {
    createRecruiterArticle(input: $input) {
      id
      slug
    }
  }
`;

export const UPDATE_RECRUITER_ARTICLE_MUTATION = gql`
  mutation UpdateRecruiterArticle($id: ID!, $input: UpdateRecruiterArticleInput!) {
    updateRecruiterArticle(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_RECRUITER_ARTICLE_MUTATION = gql`
  mutation DeleteRecruiterArticle($id: ID!) {
    deleteRecruiterArticle(id: $id) {
      message
      success
    }
  }
`;

export const ADMIN_ARTICLES_QUERY = gql`
  query AdminArticles($status: PostStatus!) {
    adminArticles(status: $status) {
      id
      title
      views
      shares
      status
      company {
        id
        name
      }
    }
  }
`;

export const APPROVE_ARTICLE_MUTATION = gql`
  mutation ApproveArticle($id: ID!) {
    approveArticle(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_ARTICLE_MUTATION = gql`
  mutation RejectArticle($id: ID!) {
    rejectArticle(id: $id) {
      message
      success
    }
  }
`;

export const ADMIN_COMPANY_JOBS_QUERY = gql`
  query AdminCompanyJobs {
    adminCompanyJobs {
      id
      name
      slug
      jobsCount
      jobs {
        id
        title
        location
        employmentType
        createdAt
        views
        appliedCount
      }
    }
  }
`;

export const MY_PACKAGE_INFO_QUERY = gql`
  query MyPackageInfo {
    myPackageInfo {
      subscription {
        plan
        planLabel
        displayPlan
        displayPlanLabel
        recruitmentExpiresAt
        expiresAt
        jobPostingCredits
        basePlanLabel
      }
      purchases {
        id
        packageType
        packageId
        packageName
        amount
        status
        startsAt
        expiresAt
        createdAt
      }
    }
  }
`;

export const CREATE_PAYMENT_ORDER_MUTATION = gql`
  mutation CreatePaymentOrder($input: CreatePaymentOrderInput!) {
    createPaymentOrder(input: $input) {
      orderId
      amount
      currency
      keyId
      purchaseId
      packageName
      prefill {
        name
        email
      }
    }
  }
`;

export const VERIFY_PAYMENT_MUTATION = gql`
  mutation VerifyPayment($input: VerifyPaymentInput!) {
    verifyPayment(input: $input) {
      success
    }
  }
`;

export const ACTIVATE_FREE_PLAN_MUTATION = gql`
  mutation ActivateFreePlan {
    activateFreePlan {
      success
      alreadyActive
      message
    }
  }
`;

export const ADMIN_PAYMENT_STATS_QUERY = gql`
  query AdminPaymentStats {
    adminPaymentStats {
      totalRevenue
      paidCount
      pendingCount
      planBreakdown {
        plan
        planLabel
        count
      }
      recentPurchases {
        id
        packageType
        packageId
        packageName
        amount
        status
        createdAt
        user {
          email
          fullName
        }
        company {
          name
        }
      }
    }
  }
`;
