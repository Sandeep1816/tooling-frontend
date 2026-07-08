"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCandidateGuard } from "@/lib/useCandidateGuard";
import JobFeed from "@/components/job/JobFeed";
import PopularArticlesFeed from "@/components/articles/PopularArticlesFeed";
import SavedJobs from "@/components/job/SavedJobs";
import MyApplicationsPage from "../applications/page";
import JobAlertsPage from "../job-alerts/page";
import CandidateProfilePanel from "@/components/candidate/CandidateProfilePanel";
import CandidateAvatar from "@/components/candidate/CandidateAvatar";
import { fetchMyCandidateProfile } from "@/lib/candidateProfile";
import { fetchPostsList } from "@/lib/graphql/posts";
import type { Post } from "@/types/Post";

type CandidateProfile = {
  fullName?: string;
  headline?: string;
  username?: string;
  avatarUrl?: string;
};

export default function CandidateFeedPage() {
  useCandidateGuard();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeSection, setActiveSection] = useState("feed");
  const [popularArticles, setPopularArticles] = useState<Post[]>([]);

  const sectionMeta: Record<
    string,
    { title: string; subtitle: string }
  > = {
    feed: {
      title: "Home Feed",
      subtitle: "Latest job opportunities for you",
    },
    articles: {
      title: "Popular Articles",
      subtitle: "Technical articles ranked by most views",
    },
    saved: {
      title: "Saved Jobs",
      subtitle: "Jobs you bookmarked to apply later",
    },
    applications: {
      title: "My Applications",
      subtitle: "Track jobs you have applied to",
    },
    alerts: {
      title: "Job Alerts",
      subtitle: "Get notified about matching roles",
    },
    profile: {
      title: "My Profile",
      subtitle: "Update your public candidate profile",
    },
  };

  const meta = sectionMeta[activeSection] ?? sectionMeta.feed;

  useEffect(() => {
    fetchMyCandidateProfile()
      .then(setProfile)
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  useEffect(() => {
    fetchPostsList(50, { status: "APPROVED" })
      .then((list) => {
        setPopularArticles(
          [...list].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
        );
      })
      .catch(() => {
        // sidebar is optional
      });
  }, []);

  const displayName =
    profile?.fullName || profile?.username || "Candidate";
  const displayHeadline =
    profile?.headline || "Aspiring Professional";

  return (
    <div className="bg-[#f3f2ef] min-h-screen lg:h-screen lg:overflow-hidden scrollbar-hide">
      <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-12 gap-6 lg:h-full">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">

          <div className="bg-white rounded-md overflow-hidden shadow-sm">
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
            <div className="flex flex-col items-center -mt-8 pb-4">
              <CandidateAvatar
                avatarUrl={profile?.avatarUrl}
                name={displayName}
                size="md"
                borderClassName="border-2 border-white"
              />
              <h3 className="font-semibold mt-2">{displayName}</h3>
              <p className="text-xs text-gray-500">
                {displayHeadline}
              </p>
            </div>
          </div>

          <nav className="bg-white rounded-md shadow-sm p-3 space-y-1 text-sm">
            <SidebarButton
              active={activeSection === "feed"}
              onClick={() => setActiveSection("feed")}
            >
              Home Feed
            </SidebarButton>
            <SidebarButton
              active={activeSection === "articles"}
              onClick={() => setActiveSection("articles")}
            >
              Popular Articles
            </SidebarButton>
            <SidebarButton
              active={activeSection === "saved"}
              onClick={() => setActiveSection("saved")}
            >
              Saved Jobs
            </SidebarButton>
            <SidebarButton
              active={activeSection === "applications"}
              onClick={() => setActiveSection("applications")}
            >
              My Applications
            </SidebarButton>
            <SidebarButton
              active={activeSection === "alerts"}
              onClick={() => setActiveSection("alerts")}
            >
              Job Alerts
            </SidebarButton>
            <SidebarButton
              active={activeSection === "profile"}
              onClick={() => setActiveSection("profile")}
            >
              My Profile
            </SidebarButton>
          </nav>
        </aside>

        {/* ================= FEED ================= */}
        <main className="col-span-12 lg:col-span-6 space-y-4 lg:overflow-y-auto scrollbar-hide lg:h-full pr-2">
          <div className="bg-white rounded-md shadow-sm p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {meta.title}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {meta.subtitle}
                </p>
              </div>
              <CandidateAvatar
                avatarUrl={profile?.avatarUrl}
                name={displayName}
                size="sm"
              />
            </div>
          </div>

          {activeSection === "feed" && <JobFeed />}

          {activeSection === "articles" && (
            <PopularArticlesFeed onArticlesLoaded={setPopularArticles} />
          )}

          {activeSection === "saved" && <SavedJobs />}

          {activeSection === "applications" && <MyApplicationsPage />}

          {activeSection === "alerts" && <JobAlertsPage />}

          {activeSection === "profile" && (
            <CandidateProfilePanel
              onProfileUpdated={(updated) =>
                setProfile({
                  fullName: updated.fullName,
                  headline: updated.headline,
                  username: updated.username,
                  avatarUrl: updated.avatarUrl,
                })
              }
            />
          )}
        </main>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="col-span-12 lg:col-span-3 space-y-4 lg:sticky lg:top-6 self-start">
          <div className="bg-white rounded-md shadow-sm p-4">
            <h4 className="font-semibold mb-3">
              Trending Articles
            </h4>

            {popularArticles.length === 0 ? (
              <p className="text-sm text-gray-500">Loading popular articles...</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {popularArticles.slice(0, 5).map((article, index) => (
                  <li key={article.id}>
                    <Link
                      href={`/post/${article.slug}`}
                      className="group block"
                    >
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                        {index + 1}. {article.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(article.views ?? 0).toLocaleString()} views
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href="/articles"
              className="inline-block mt-4 text-xs font-medium text-blue-600 hover:underline"
            >
              View all articles →
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}

function SidebarButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block text-left w-full px-3 py-2 rounded-md transition-colors ${
        active
          ? "bg-blue-50 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}
