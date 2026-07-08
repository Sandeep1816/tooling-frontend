"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Briefcase,
} from "lucide-react";
import CompanyTabs from "@/components/company/CompanyTabs";
import CompanyHeader from "@/components/company/CompanyHeader";
import { useCompanyProfile } from "@/lib/company/useCompanyProfile";

export default function AboutPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { company, loading, following, toggleFollow } = useCompanyProfile(slug);

  if (loading) return <div className="p-10">Loading...</div>;
  if (!company) return <div className="p-10">Company not found.</div>;

  const industryName =
    typeof company.industry === "object"
      ? company.industry?.name
      : company.industry;
  const followers = company.followerCount ?? company.followers ?? 0;

  return (
    <div className="bg-[#f3f2ef] min-h-screen">
      <div className="max-w-[1128px] mx-auto px-4 py-6 space-y-6">
        
        <CompanyHeader 
          company={company}
          isFollowing={following}
          onFollow={toggleFollow}
        />

        <CompanyTabs slug={company.slug} active="about" />

        <div className="space-y-6">
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 leading-8 whitespace-pre-line">
              {company.description || "No company description available."}
            </p>
          </section>

          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-5">Company Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <Building2 className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Industry</p>
                  <p>{industryName || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Location</p>
                  <p>{company.location || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Company Size</p>
                  <p>{company.companySize || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Calendar className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Founded</p>
                  <p>{company.founded || "Not specified"}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Website</p>
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <p>Not specified</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Followers</p>
                  <p>{followers}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}