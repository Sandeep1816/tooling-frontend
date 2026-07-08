export type Company = {
  id: string
  name: string
  slug: string
  isVerified: boolean
  createdAt: string
}

export type Recruiter = {
  id: string
  username: string
  email: string
  createdAt: string
  company?: {
    name: string
  }
}

export type Directory = {
  id: string
  name: string
  slug: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string

  company?: {
    name: string
  }

  submittedBy?: {
    username: string
  }
}

