"use client";

import RichText from "@/components/RichText";
import Container from "@/components/Container";
import { useEffect, useState } from "react";

interface GitHubIssue {
  id: number;
  title: string;
  html_url: string;
  repository_url: string;
}

interface GitHubSearchResponse {
  items: GitHubIssue[];
}

export default function GoodFirstIssues() {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Filters
  const [difficulty, setDifficulty] = useState("good first issue");
  const [sdk, setSdk] = useState("");

  useEffect(() => {
    // Maps
    const difficultyMap = {
      "good first issue": 'label:"good first issue"',
      beginner: "label:beginner",
      intermediate: "label:intermediate",
      advanced: "label:advanced",
    } as const;

    const sdkMap = {
      python: "repo:hiero-ledger/hiero-sdk-python",
      javascript: "repo:hiero-ledger/hiero-sdk-js",
      cpp: "repo:hiero-ledger/hiero-sdk-cpp",
      java: "repo:hiero-ledger/hiero-sdk-java",
      go: "repo:hiero-ledger/hiero-sdk-go",
    } as const;

    const buildQuery = () => {
      let q = "state:open";

      const getSdkValue = (key: string | null) => {
        if (key && key in sdkMap) {
          return sdkMap[key as keyof typeof sdkMap];
        }
        return undefined;
      };

      const getDifficultyValue = (key: string | null) => {
        if (key && key in difficultyMap) {
          return difficultyMap[key as keyof typeof difficultyMap];
        }
        return undefined;
      };

      const sdkValue = getSdkValue(sdk);
      const difficultyValue = getDifficultyValue(difficulty);

      if (sdkValue) {
        q += ` ${sdkValue}`;
      } else {
        q += " org:hiero-ledger";
      }

      if (difficultyValue) {
        q += ` ${difficultyValue}`;
      }

      return q;
    };

    const fetchIssues = async () => {
      setLoading(true);
      setError(false);
      const query = buildQuery();

      try {
        const res = await fetch(
          `https://api.github.com/search/issues?q=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status}`);
        }

        const data = (await res.json()) as GitHubSearchResponse;
        setIssues(data.items);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
        setError(true);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchIssues();
  }, [difficulty, sdk]);

  const getRepositoryBadgeColor = (repo: string) => {
    const repoName = repo?.toLowerCase() || "";
    if (repoName.includes("python")) return "bg-blue-100 text-blue-800";
    if (repoName.includes("js") || repoName.includes("javascript")) return "bg-yellow-100 text-yellow-800";
    if (repoName.includes("cpp")) return "bg-purple-100 text-purple-800";
    if (repoName.includes("java")) return "bg-orange-100 text-orange-800";
    if (repoName.includes("go")) return "bg-cyan-100 text-cyan-800";
    return "bg-gray-light text-gray";
  };

  return (
    <main>
      <Container className="py-4 sm:py-10">
        {/* Header Section */}
        <div className="mb-12">
          <div className="space-y-4 mb-6">
            <h1 className="text-5xl sm:text-6xl font-bold text-charcoal leading-tight">Find Your Issue</h1>
            <p className="text-xl text-gray max-w-2xl">Discover open issues across Hiero SDKs and contribute to the future of distributed ledger technology.</p>
          </div>
          
          {/* Filter Cards */}
          <div className="bg-gray-light/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
            <h3 className="text-sm font-bold text-gray uppercase tracking-widest mb-6">Filter Issues</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col">
                <label
                  htmlFor="difficulty-filter"
                  className="block text-sm font-semibold text-charcoal mb-3"
                >
                  Difficulty Level
                </label>
                <select
                  id="difficulty-filter"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-red/50 focus:border-red transition-all duration-200 cursor-pointer hover:border-gray-400"
                >
                  <option value="good first issue">Good First Issue</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label
                  htmlFor="sdk-filter"
                  className="block text-sm font-semibold text-charcoal mb-3"
                >
                  Programming Language
                </label>
                <select
                  id="sdk-filter"
                  value={sdk}
                  onChange={(e) => setSdk(e.target.value)}
                  className="appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-charcoal font-medium focus:outline-none focus:ring-2 focus:ring-red/50 focus:border-red transition-all duration-200 cursor-pointer hover:border-gray-400"
                >
                  <option value="">All Languages</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 mb-4">
                <div className="h-12 w-12 border-4 border-gray-200 border-t-red rounded-full animate-spin"></div>
              </div>
              <p className="text-lg text-gray font-medium">Loading issues...</p>
              <p className="text-sm text-gray mt-2 opacity-70">Fetching opportunities from GitHub</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 p-8 text-center">
            <p className="text-red-900 font-bold text-lg mb-2">
              Unable to load issues
            </p>
            <p className="text-red-800 text-sm">
              Please try again later or visit the <a href="https://github.com/hiero-ledger" target="_blank" rel="noopener noreferrer" className="font-semibold underline">GitHub repositories</a> directly.
            </p>
          </div>
        ) : issues.length === 0 ? (
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-12 text-center">
            <p className="text-charcoal font-bold text-lg mb-2">
              No issues found
            </p>
            <p className="text-gray text-sm">
              Try adjusting your filters or check back soon for new opportunities to contribute.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <span className="inline-block px-4 py-2 bg-red-100 text-red-800 font-bold text-sm rounded-lg">
                {issues.length} Issue{issues.length !== 1 ? "s" : ""} Available
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => {
                const repo = issue.repository_url.split("/").pop() || "Repository";
                return (
                  <a
                    key={issue.id}
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-red transition-all duration-300 overflow-hidden"
                  >
                    {/* Gradient Background on Hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative space-y-4 flex flex-col flex-1">
                      {/* Repository Badge */}
                      <div className={`inline-block w-fit px-3 py-1 rounded-lg text-xs font-semibold ${getRepositoryBadgeColor(repo)}`}>
                        {repo}
                      </div>

                      {/* Issue Title */}
                      <h3 className="text-base font-bold text-charcoal group-hover:text-red transition-colors line-clamp-2 leading-snug flex-1">
                        <RichText markdown={issue.title} />
                      </h3>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray">
                          View on GitHub
                        </span>
                        <span className="text-red font-bold group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}
      </Container>
    </main>
  );
}