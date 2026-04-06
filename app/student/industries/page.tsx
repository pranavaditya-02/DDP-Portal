"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Industry {
  id: number;
  industry: string;
  address: string;
  website_link: string;
  active_now: boolean;
  created_at: string;
  updated_at: string;
}

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [activeNow, setActiveNow] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchIndustries = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getIndustries();
      setIndustries(response.industries || []);
    } catch (error) {
      toast.error("Failed to load industries.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  const filteredIndustries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return industries;
    return industries.filter((item) =>
      item.industry.toLowerCase().includes(q) ||
      item.address.toLowerCase().includes(q) ||
      item.website_link.toLowerCase().includes(q)
    );
  }, [industries, search]);

  const resetForm = (hideForm = true) => {
    setIndustry("");
    setAddress("");
    setWebsite("");
    setActiveNow(true);
    setEditingId(null);
    if (hideForm) {
      setShowForm(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!industry.trim() || !address.trim() || !website.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await apiClient.updateIndustry(editingId, {
          industry: industry.trim(),
          address: address.trim(),
          website_link: website.trim(),
          active_now: activeNow,
        });
        toast.success("Industry updated successfully.");
      } else {
        await apiClient.createIndustry({
          industry: industry.trim(),
          address: address.trim(),
          website_link: website.trim(),
          active_now: activeNow,
        });
        toast.success("Industry added successfully.");
      }
      await fetchIndustries();
      resetForm();
    } catch (error) {
      toast.error("Failed to save industry.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Industry) => {
    setEditingId(item.id);
    setIndustry(item.industry);
    setAddress(item.address);
    setWebsite(item.website_link);
    setActiveNow(item.active_now);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Delete this industry? This action cannot be undone.");
    if (!confirmed) return;
    try {
      await apiClient.deleteIndustry(id);
      toast.success("Industry deleted.");
      setIndustries((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      toast.error("Failed to delete industry.");
      console.error(error);
    }
  };

  const handleToggleActive = async (item: Industry) => {
    try {
      await apiClient.updateIndustry(item.id, { active_now: !item.active_now });
      toast.success(`${item.active_now ? 'Deactivated' : 'Activated'} industry successfully.`);
      setIndustries((prev) =>
        prev.map((industryItem) =>
          industryItem.id === item.id ? { ...industryItem, active_now: !industryItem.active_now } : industryItem
        )
      );
    } catch (error) {
      toast.error("Failed to update industry status.");
      console.error(error);
    }
  };

  const downloadTemplate = () => {
    const csv = [
      ['industry', 'address', 'website_link', 'active_now'],
      ['Information Technology', '123 Main St, City', 'https://example.com', 'true'],
      ['Finance', '456 Market Rd, City', 'https://finance.example.com', 'true'],
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'industries-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadFile(file);
  };

  const handleImport = async () => {
    if (!uploadFile) {
      toast.error('Please choose a CSV template to upload.');
      return;
    }

    setUploading(true);
    try {
      const response = await apiClient.importIndustriesCsv(uploadFile);
      toast.success(response?.message || 'Industries imported successfully.');
      setUploadFile(null);
      await fetchIndustries();
    } catch (error) {
      toast.error('Failed to import industries.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Industries</h1>
            <p className="text-sm text-slate-600">Manage company industry details and active status.</p>
          </div>
          <button
            onClick={() => {
              resetForm(false);
              setShowForm(true);
              document.getElementById('industryInput')?.focus();
            }}
            className="btn-primary w-fit"
          >
            <Plus size={16} />
            Add Industry
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card-base p-5 mb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Industry *</label>
              <input
                id="industryInput"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="input-base"
                placeholder="e.g., Information Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-base"
                placeholder="Company office address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Website Link *</label>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input-base"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={activeNow}
                onChange={(e) => setActiveNow(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Active now
            </label>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => resetForm()}
                className="btn-outline"
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {editingId ? 'Update Industry' : 'Create Industry'}
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={downloadTemplate}
                className="btn-outline"
              >
                Download template
              </button>

              <label className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-slate-300 sm:max-w-md">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span>{uploadFile ? uploadFile.name : 'Choose industry CSV template'}</span>
              </label>

              <button
                type="button"
                onClick={handleImport}
                className="btn-primary"
                disabled={!uploadFile || uploading}
              >
                {uploading ? 'Importing...' : 'Import industries'}
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Download the template, fill industry details in CSV format, then upload it here to bulk add industries.
            </p>
          </div>
        </form>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search industries, address, website..."
              className="rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <p className="text-sm text-slate-500">{filteredIndustries.length} entries found</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Industry</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Address</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Website</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Created</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredIndustries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No industries found.</td>
                </tr>
              ) : (
                filteredIndustries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{item.industry}</td>
                    <td className="px-4 py-3 text-slate-700">{item.address}</td>
                    <td className="px-4 py-3 text-blue-600 underline truncate max-w-[250px]">
                      <a href={item.website_link} target="_blank" rel="noreferrer">
                        {item.website_link}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.active_now ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                        {item.active_now ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{new Date(item.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:text-blue-800 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-2 rounded transition-colors ${item.active_now ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                        title={item.active_now ? 'Deactivate' : 'Activate'}
                      >
                        {item.active_now ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:text-red-700 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
