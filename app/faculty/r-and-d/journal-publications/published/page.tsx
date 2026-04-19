'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface JournalPublicationRecord {
  id: string;
  faculty: string;
  indexing: string;
  journalName: string;
  submittedTitle: string;
  submittedDate: string;
  proofUrl?: string | null;
  status: 'Submitted' | 'Under Review' | 'Accepted for Publication' | 'Rejected for Publication';
}

interface JournalPublicationApiItem {
  publication_id: string | number;
  faculty_id: string;
  indexing_type: string;
  journal_name: string;
  submitted_journal_title: string;
  submitted_date: string;
  proof_document_path?: string | null;
  publication_status: JournalPublicationRecord['status'];
}

const statusOrder = ['Submitted', 'Under Review', 'Accepted for Publication', 'Rejected for Publication'] as const;

const renderStatusBadge = (status: JournalPublicationRecord['status']) => {
  const config: Record<JournalPublicationRecord['status'], { label: string; className: string }> = {
    Submitted: { label: 'Submitted', className: 'bg-slate-100 text-slate-700' },
    'Under Review': { label: 'Under Review', className: 'bg-amber-100 text-amber-800' },
    'Accepted for Publication': { label: 'Accepted', className: 'bg-emerald-100 text-emerald-800' },
    'Rejected for Publication': { label: 'Rejected', className: 'bg-rose-100 text-rose-800' },
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config[status].className}`}>
      {config[status].label}
    </span>
  );
};

export default function PublishedPage() {
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<JournalPublicationRecord['status'] | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [records, setRecords] = useState<JournalPublicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const data = await apiClient.getJournalPublicationsApplied();
        const publications: JournalPublicationApiItem[] = Array.isArray(data.publications) ? data.publications : [];
        const publishedItems = publications
          .map((item): JournalPublicationRecord => ({
            id: String(item.publication_id),
            faculty: item.faculty_id,
            indexing: item.indexing_type,
            journalName: item.journal_name,
            submittedTitle: item.submitted_journal_title,
            submittedDate: item.submitted_date,
            proofUrl: item.proof_document_path,
            status: item.publication_status,
          }))
          .filter((item) => item.status === 'Accepted for Publication');

        setRecords(publishedItems);
      } catch (error: any) {
        setFetchError(error?.message || 'Unable to load published publications.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesQuery = query.trim() === '' ||
        [record.faculty, record.journalName, record.submittedTitle, record.indexing, record.status]
          .some((value) => value.toLowerCase().includes(query.trim().toLowerCase()));

      const matchesStatus = !filterStatus || record.status === filterStatus;
      return matchesQuery && matchesStatus;
    });
  }, [filterStatus, query, records]);

  const statusCounts = useMemo(
    () => ({
      Submitted: records.filter((record) => record.status === 'Submitted').length,
      'Under Review': records.filter((record) => record.status === 'Under Review').length,
      'Accepted for Publication': records.filter((record) => record.status === 'Accepted for Publication').length,
      'Rejected for Publication': records.filter((record) => record.status === 'Rejected for Publication').length,
    }),
    [records],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Journal Publications - Published</h1>
          <p className="mt-2 text-sm text-slate-500">
            Browse published journal publication records and access proof files.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {statusOrder.map((status) => (
              <div key={status} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1">
                <span className="text-slate-500">{status}</span>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {statusCounts[status] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-[380px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search faculty, journal or status..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-slate-300 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <span className="text-sm text-slate-500">{filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'}</span>
          </div>
        </div>

        {showFilters ? (
          <div className="border-b border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Filter by status
                </label>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value as JournalPublicationRecord['status'] | '')}
                  className="input-base w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All statuses</option>
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto p-4">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-slate-500">Loading published publications...</div>
          ) : fetchError ? (
            <div className="p-8 text-center text-sm text-rose-600">{fetchError}</div>
          ) : (
            <table className="min-w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-2 px-3">Faculty</th>
                  <th className="pb-2 px-3">Indexing</th>
                  <th className="pb-2 px-3">Journal</th>
                  <th className="pb-2 px-3">Submitted Title</th>
                  <th className="pb-2 px-3">Submitted Date</th>
                  <th className="pb-2 px-3">Proof</th>
                  <th className="pb-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <tr key={record.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.faculty}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{record.indexing}</td>
                    <td className="px-3 py-4 text-sm text-slate-700 min-w-[220px]">{record.journalName}</td>
                    <td className="px-3 py-4 text-sm text-slate-700 min-w-[260px]">{record.submittedTitle}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700">{new Date(record.submittedDate).toLocaleDateString()}</td>
                    <td className="px-3 py-4 text-sm">
                      {record.proofUrl ? (
                        <a href={record.proofUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">
                          View proof
                        </a>
                      ) : (
                        <span className="text-slate-500">No proof</span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm">{renderStatusBadge(record.status)}</td>
                  </tr>
                ))}
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-500">
                      No published publications found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
