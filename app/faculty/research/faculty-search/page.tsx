"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2, Search, School, UserSearch, X, ExternalLink } from "lucide-react";

type SourceName = "openAlex" | "crossref" | "orcid";

type SourceResult = {
  source: SourceName;
  ok: boolean;
  status: number | null;
  endpoint: string;
  data: unknown | null;
  error: string | null;
};

type SearchResponse = {
  college: string;
  filters: {
    name: string;
    orcid: string;
    includeOrcid: boolean;
  };
  generatedAt: string;
  results: SourceResult[];
};

type PublicationRecord = {
  id: string;
  title: string;
  doi: string;
  year: string;
  authors: string[];
  venue: string;
  publisher: string;
  type: string;
  page: string;
  referencesCount: number;
  citedByCount: number;
  url: string;
  abstractText: string;
};

const DEFAULT_COLLEGE = "Bannari Amman Institute of Technology";

const stripHtmlTags = (input: string) => input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const getCrossrefPublications = (results: SourceResult[]): PublicationRecord[] => {
  const crossrefResult = results.find((item) => item.source === "crossref");
  if (!crossrefResult?.data || typeof crossrefResult.data !== "object") return [];

  const payload = crossrefResult.data as {
    message?: {
      items?: unknown[];
    };
  };

  const items = Array.isArray(payload.message?.items) ? payload.message?.items : [];

  const publications = items.map((item) => {
    const row = item as {
      title?: string[];
      DOI?: string;
      issued?: { "date-parts"?: number[][] };
      author?: Array<{ given?: string; family?: string }>;
      publisher?: string;
      type?: string;
      page?: string;
      "is-referenced-by-count"?: number;
      "references-count"?: number;
      URL?: string;
      resource?: { primary?: { URL?: string } };
      "container-title"?: string[];
      abstract?: string;
    };

    const authors = (row.author || [])
      .map((author) => [author.given, author.family].filter(Boolean).join(" ").trim())
      .filter(Boolean);

    const title = row.title?.[0]?.trim() || "Untitled publication";
    const doi = row.DOI || "-";
    const year = String(row.issued?.["date-parts"]?.[0]?.[0] || "-");
    const id = `${doi}-${title}`;

    return {
      id,
      title,
      doi,
      year,
      authors,
      venue: row["container-title"]?.[0] || "-",
      publisher: row.publisher || "-",
      type: row.type || "-",
      page: row.page || "-",
      referencesCount: Number(row["references-count"] || 0),
      citedByCount: Number(row["is-referenced-by-count"] || 0),
      url: row.resource?.primary?.URL || row.URL || "",
      abstractText: row.abstract ? stripHtmlTags(row.abstract) : "",
    } satisfies PublicationRecord;
  });

  // Deduplicate by DOI when available.
  const byDoi = new Map<string, PublicationRecord>();
  for (const publication of publications) {
    const key = publication.doi !== "-" ? publication.doi : publication.id;
    if (!byDoi.has(key)) {
      byDoi.set(key, publication);
    }
  }

  return Array.from(byDoi.values());
};

export default function FacultySearchPage() {
  const [name, setName] = useState("");
  const [orcid, setOrcid] = useState("");
  const [college, setCollege] = useState(DEFAULT_COLLEGE);
  const [includeOrcid, setIncludeOrcid] = useState(true);
  const [facultyOptions, setFacultyOptions] = useState<string[]>([]);
  const [facultyOptionsLoading, setFacultyOptionsLoading] = useState(false);
  const [facultyOptionsError, setFacultyOptionsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<PublicationRecord | null>(null);

  const hasAnyFilter = useMemo(() => [name, orcid].some((value) => value.trim().length > 0), [name, orcid]);

  const publications = useMemo(() => {
    if (!result) return [];
    return getCrossrefPublications(result.results);
  }, [result]);

  useEffect(() => {
    let mounted = true;

    const loadFacultyOptions = async () => {
      try {
        setFacultyOptionsLoading(true);
        setFacultyOptionsError(null);

        const response = await fetch("/api/faculty-names", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const payload = (await response.json()) as { names?: string[]; error?: string };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to load faculty names");
        }

        if (!mounted) return;
        setFacultyOptions(Array.isArray(payload.names) ? payload.names : []);
      } catch (loadError) {
        if (!mounted) return;
        setFacultyOptions([]);
        setFacultyOptionsError(loadError instanceof Error ? loadError.message : "Failed to load faculty names");
      } finally {
        if (!mounted) return;
        setFacultyOptionsLoading(false);
      }
    };

    void loadFacultyOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!hasAnyFilter) {
      setError("Enter at least one filter: name or ORCID.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedPublication(null);

      const params = new URLSearchParams();
      if (name.trim()) params.set("name", name.trim());
      if (orcid.trim()) params.set("orcid", orcid.trim());
      params.set("college", college.trim() || DEFAULT_COLLEGE);
      params.set("includeOrcid", includeOrcid ? "true" : "false");

      const response = await fetch(`/api/faculty-search?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      const payload = (await response.json()) as SearchResponse | { error?: string };

      if (!response.ok) {
        const message = typeof payload === "object" && payload && "error" in payload ? payload.error : "Search failed";
        throw new Error(message || "Search failed");
      }

      setResult(payload as SearchResponse);
    } catch (searchError) {
      console.error(searchError);
      setResult(null);
      setError(searchError instanceof Error ? searchError.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-200/30 blur-2xl" />
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-cyan-200/40 blur-2xl" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm">
              <UserSearch className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Faculty Research Publication Explorer</h1>
              <p className="mt-1 text-sm text-slate-600">
                Search and explore faculty publications in a card layout. Click any card to view full details.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            <School className="h-3.5 w-3.5" />
            College: {DEFAULT_COLLEGE}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <form className="space-y-4" onSubmit={handleSearch}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">Faculty Name</span>
              <div className="space-y-1">
                <input
                  list="faculty-name-options"
                  className="input-base"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Search and select faculty name"
                />
                <datalist id="faculty-name-options">
                  {facultyOptions.map((facultyName) => (
                    <option key={facultyName} value={facultyName} />
                  ))}
                </datalist>
                <p className="text-xs text-slate-500">
                  {facultyOptionsLoading
                    ? "Loading faculty names..."
                    : `Available faculty names: ${facultyOptions.length}`}
                </p>
                {facultyOptionsError ? <p className="text-xs text-red-600">{facultyOptionsError}</p> : null}
              </div>
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">ORCID</span>
              <input
                className="input-base"
                value={orcid}
                onChange={(event) => setOrcid(event.target.value)}
                placeholder="e.g. 0000-0002-1825-0097"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="font-medium text-slate-700">College</span>
              <input
                className="input-base"
                value={college}
                onChange={(event) => setCollege(event.target.value)}
                placeholder="College name"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={includeOrcid}
                onChange={(event) => setIncludeOrcid(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Include ORCID matching support
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? "Searching..." : "Search Publications"}
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </section>
      ) : null}

      {result ? (
        <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p>
              Last fetched: <span className="font-medium text-slate-900">{new Date(result.generatedAt).toLocaleString()}</span>
            </p>
            <p>
              Active college filter: <span className="font-medium text-slate-900">{result.college}</span>
            </p>
            <p>
              Publications found: <span className="font-medium text-slate-900">{publications.length}</span>
            </p>
          </div>

          {publications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              No publications found for the current search.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {publications.map((publication) => (
                <button
                  key={publication.id}
                  type="button"
                  onClick={() => setSelectedPublication(publication)}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
                      {publication.year}
                    </span>
                    <span className="text-[11px] font-medium uppercase text-slate-500">{publication.type}</span>
                  </div>

                  <h3 className="line-clamp-3 text-sm font-semibold text-slate-900">{publication.title}</h3>

                  <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                    {publication.authors.length > 0 ? publication.authors.join(", ") : "Authors not available"}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{publication.venue}</p>

                  <p className="mt-3 text-[11px] text-slate-500">
                    DOI: <span className="font-medium text-slate-700">{publication.doi}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : null}

      {selectedPublication ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-slate-900">Publication Details</h2>
              <button
                type="button"
                onClick={() => setSelectedPublication(null)}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-base font-semibold text-slate-900">{selectedPublication.title}</h3>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Year</p>
                <p className="font-medium text-slate-900">{selectedPublication.year}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Type</p>
                <p className="font-medium text-slate-900">{selectedPublication.type}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Publisher</p>
                <p className="font-medium text-slate-900">{selectedPublication.publisher}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Venue</p>
                <p className="font-medium text-slate-900">{selectedPublication.venue}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs text-slate-500">Authors</p>
                <p className="font-medium text-slate-900">
                  {selectedPublication.authors.length > 0
                    ? selectedPublication.authors.join(", ")
                    : "Authors not available"}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs text-slate-500">DOI</p>
                <p className="break-all font-medium text-slate-900">{selectedPublication.doi}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Pages</p>
                <p className="font-medium text-slate-900">{selectedPublication.page}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">References / Cited By</p>
                <p className="font-medium text-slate-900">
                  {selectedPublication.referencesCount} / {selectedPublication.citedByCount}
                </p>
              </div>
            </div>

            {selectedPublication.abstractText ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Abstract</p>
                <p className="mt-1 text-sm text-slate-700">{selectedPublication.abstractText}</p>
              </div>
            ) : null}

            {selectedPublication.url ? (
              <div className="mt-4">
                <a
                  href={selectedPublication.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Open Publication Link
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
