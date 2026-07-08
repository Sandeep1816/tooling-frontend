import Link from "next/link"
import { fetchPostsList, categorySlugOf } from "@/lib/graphql/posts"

export default async function TopicsPage() {
  const posts = await fetchPostsList(50)

  const whatsNewPosts = posts
    .filter((p) => categorySlugOf(p).includes("whatsnew"))
    .slice(0, 5)

  // ================= STATIC TOPIC LISTS =================
  const allTopicsLeft = [
    "30 Under 30",
    "3D Printing",
    "Additive Manufacturing",
    "Aluminum",
    "Amerimold",
    "Analysis",
    "Artificial Intelligence",
    "Associations",
    "Automation",
    "Automotive",
    "Auxiliary Equipment",
    "Basics",
    "Build",
    "Business Strategy",
    "Case Study",
    "Conformal Cooling",
    "Consumer",
    "Cutting Tools",
    "Data Management Software",
    "Design & Mfg. Software",
    "Digital Demos",
    "Drills",
    "Economics",
    "Editorial",
    "Editorial Board Insight",
    "EDM",
    "Education",
    "Electronics",
    "Engineer",
    "FAQ",
    "Five Axis",
    "Grinding",
    "High Speed Machining",
    "HMC",
    "Hot Runners",
    "ICYMI",
  ]

  const allTopicsMiddle = [
    "IMTS",
    "Industry 4.0",
    "Inspection & Measurement",
    "Jobposting",
    "Leadership",
    "Leadtime Leader",
    "Machining",
    "Maintain",
    "Maintenance & Repair",
    "Manage",
    "Marketing",
    "Medical",
    "Tooling25",
    "ToolingComponents",
    "ToolingMaterials",
    "Molding Equipment",
    "Toolmaking Conference",
    "NPE",
    "Packaging",
    "Profile",
    "PTXPO",
    "Rapid Tooling",
    "Regulations",
    "Safety",
    "Sales",
    "Shop Talk",
    "Supply Chain",
    "Surface Treatment",
    "Sustainability",
    "Tips",
    "Tool Steel",
    "Top Shops",
    "Turning",
    "VMC",
    "Workforce Development",
    "Workholding",
  ]

  const mostPopular = [
    "Data Management Software",
    "Design & Mfg. Software",
    "Surface Treatment",
    "Machining",
    "ToolingMaterials",
    "Hot Runners",
    "Business Strategy",
    "Engineer",
    "ToolingComponents",
    "Maintenance & Repair",
  ]

  const multimediaFormats = [
    "Articles",
    "News",
    "Products",
    "Industry Talks",
    "Video",
    "Podcast",
    "Webinars",
  ]

  return (
    <main className="bg-white">

      {/* ================= WHAT'S NEW STRIP ================= */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {whatsNewPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.slug}`}
                className="group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="bg-[#0072BC] text-white text-[10px] font-bold px-2 py-0.5 uppercase">
                    {typeof post.category === "object"
                      ? post.category?.name
                      : post.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : ""}
                  </span>
                </div>

                <p className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#C70000]">
                  {post.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ALL TOPICS ================= */}
      <section className="max-w-[1320px] mx-auto px-6 py-14">
        <h1 className="text-[32px] font-bold text-[#003B5C] mb-2">
          All Topics
        </h1>

        <p className="text-gray-600 mb-10">
          Interested in a particular topic? Visit our topic pages through the links below.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_320px] gap-16">

          {/* LEFT COLUMN */}
          <div>
            <h2 className="text-lg font-semibold mb-6">All Topics</h2>
            <ul className="space-y-2">
              {allTopicsLeft.map((topic) => (
                <li key={topic}>
                  <Link
                    href={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-[#003B5C] hover:underline"
                  >
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* MIDDLE COLUMN */}
          <div>
            <h2 className="text-lg font-semibold mb-6 invisible">All Topics</h2>
            <ul className="space-y-2">
              {allTopicsMiddle.map((topic) => (
                <li key={topic}>
                  <Link
                    href={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-[#003B5C] hover:underline"
                  >
                    {topic}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-12">
            <div>
              <h3 className="text-lg font-semibold mb-6">Most Popular</h3>
              <ul className="space-y-2">
                {mostPopular.map((topic) => (
                  <li key={topic}>
                    <Link
                      href={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-[#003B5C] hover:underline"
                    >
                      {topic}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Multimedia Formats</h3>
              <ul className="space-y-2">
                {multimediaFormats.map((topic) => (
                  <li key={topic}>
                    <Link
                      href={`/topics/${topic.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-[#003B5C] hover:underline"
                    >
                      {topic}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

    </main>
  )
}
