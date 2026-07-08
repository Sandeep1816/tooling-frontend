"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@/lib/apollo/hooks";
import { Mail, Clock, FileText, Loader2 } from "lucide-react";
import { downloadFile } from "@/lib/Downloadfile";
import { APPLICATION_QUERY } from "@/lib/graphql/operations";
import { useState } from "react";

function formatStatus(status: string) {
  return status.toLowerCase().replace(/_/g, " ");
}

export default function ApplicantDetailsPage() {
  const params = useParams();
  const applicationId = params.applicationId as string;
  const [downloading, setDownloading] = useState(false);

  const { data, loading } = useQuery(APPLICATION_QUERY, {
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const application = data?.application;

  async function handleDownloadResume(url: string | null, fileName: string) {
    if (!url) return;

    setDownloading(true);
    const result = await downloadFile(url, fileName);
    setDownloading(false);

    if (!result.success) {
      alert(result.error || "Could not download resume. Please try again.");
    }
  }

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!application) {
    return <div className="p-10">Application not found.</div>;
  }

  const applicant = application.applicant;
  const job = application.job;

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-6 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {applicant?.fullName || "Candidate"}
            </h1>
            <p className="text-gray-500 mt-2">
              {applicant?.headline || "No headline"}
            </p>
          </div>

          <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 capitalize">
            {formatStatus(application.status)}
          </span>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <Mail size={16} />
            {applicant?.email}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={16} />
            {new Date(application.createdAt).toLocaleDateString()}
          </span>
        </div>

        <hr className="my-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="font-semibold">Job</p>
            <p>{job?.title}</p>
          </div>
          <div>
            <p className="font-semibold">Company</p>
            <p>{job?.company?.name || job?.companyName}</p>
          </div>
          <div>
            <p className="font-semibold">Location</p>
            <p>{job?.location}</p>
          </div>
          <div>
            <p className="font-semibold">Employment Type</p>
            <p>{job?.employmentType}</p>
          </div>
        </div>

        {application.resumeUrl && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Resume</h3>
            <button
              onClick={() =>
                handleDownloadResume(
                  application.resumeUrl,
                  `${applicant?.fullName || "Resume"}.pdf`
                )
              }
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FileText size={18} />
                  Download Resume
                </>
              )}
            </button>
          </div>
        )}

        {application.coverNote && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Cover Note</h3>
            <div className="bg-gray-100 rounded-lg p-4 whitespace-pre-wrap">
              {application.coverNote}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
