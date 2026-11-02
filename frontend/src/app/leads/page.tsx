'use client';

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/api";

type Lead = {
    id: string;
    formType: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    payload: Record<string, any>;
    status: string;
    createdAt: string;
};

const FORM_TYPE_LABELS: Record<string, string> = {
    home_triage: "Home – Plan Your Capital",
    contact_inquiry: "Contact – Mandate Appraisal",
    contact_us: "Home – Get in Touch",
};

export default function LeadsPage() {
    const [rows, setRows] = useState<Lead[]>([]);
    const [selected, setSelected] = useState<Lead | null>(null);
    const [filter, setFilter] = useState("ALL");
    const [formFilter, setFormFilter] = useState("ALL");
    const [error, setError] = useState("");

    async function load() {
        try {
            setRows(await api("/leads"));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not load leads");
        }
    }

    useEffect(() => {
        load();
    }, []);

    async function status(id: string, status: string) {
        try {
            await api(`/leads/${id}`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });

            await load();
            setSelected(s => s ? { ...s, status } : s);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Could not update lead");
        }
    }

    // Both filters work together: status + the website form that submitted the lead.
    const shown = rows.filter(r => {
        const matchesStatus = filter === "ALL" || r.status === filter;
        const matchesForm = formFilter === "ALL" || r.formType === formFilter;
        return matchesStatus && matchesForm;
    });

    function formatLabel(key: string) {
        return key
            .replace(/([A-Z])/g, " $1")
            .replace(/[_-]/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/^./, char => char.toUpperCase());
    }

    function getFormTypeLabel(formType: string) {
        return FORM_TYPE_LABELS[formType] || formatLabel(formType);
    }

    function formatValue(value: any): string {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (Array.isArray(value)) {
            return value.map(item => formatValue(item)).join(", ");
        }

        if (typeof value === "object") {
            return Object.entries(value)
                .map(([key, val]) => `${formatLabel(key)}: ${formatValue(val)}`)
                .join(" · ");
        }

        if (typeof value === "boolean") {
            return value ? "Yes" : "No";
        }

        return String(value);
    }

    function getAdditionalFields(lead: Lead) {
        const payload = lead.payload || {};

        const excludedFields = [
            "id",
            "name",
            "fullName",
            "email",
            "phone",
            "message",
            "source",
            "formType",
            "submittedAt",
            "status",
        ];

        return Object.entries(payload).filter(([key, value]) => {
            return !excludedFields.includes(key) &&
                value !== null &&
                value !== undefined &&
                value !== "";
        });
    }

    return (
        <AdminShell>
            <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Lead Management</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Enquiries received from all website forms.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <select
                        value={formFilter}
                        onChange={e => setFormFilter(e.target.value)}
                        aria-label="Filter leads by website form"
                        className="min-w-0 flex-1 sm:flex-none border rounded-lg p-2 text-sm bg-white"
                    >
                        <option value="ALL">All forms</option>
                        <option value="home_triage">Home – Plan Your Capital</option>
                        <option value="contact_inquiry">Contact – Mandate Appraisal</option>
                        <option value="contact_us">Home – Get in Touch</option>
                    </select>

                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        aria-label="Filter leads by status"
                        className="min-w-0 flex-1 sm:flex-none border rounded-lg p-2 text-sm bg-white"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                </div>
            </div>

            {error && (
                <p className="text-red-600 text-sm mb-3">{error}</p>
            )}

            <div className="grid xl:grid-cols-[1fr_360px] gap-5 items-start">
                {/* Leads List */}
                <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="p-4 border-b text-sm font-medium">
                        {shown.length} enquiries
                    </div>

                    {shown.length === 0 ? (
                        <p className="p-6 text-sm text-gray-500">
                            No enquiries found for the selected filters. New website submissions
                            will appear here once the forms are connected to the leads API.
                        </p>
                    ) : (
                        shown.map(l => (
                            <button
                                key={l.id}
                                onClick={() => setSelected(l)}
                                className={`w-full text-left p-4 border-b hover:bg-gray-50 ${selected?.id === l.id ? "bg-[#edf3ef]" : ""}`}
                            >
                                <div className="flex flex-wrap justify-between gap-2">
                                    <span className="font-medium text-sm">
                                        {l.name || "Website enquiry"}
                                    </span>

                                    <span className="text-[11px] rounded-full bg-gray-100 px-2 py-1">
                                        {l.status}
                                    </span>
                                </div>

                                <div className="text-xs text-gray-500 mt-1">
                                    {getFormTypeLabel(l.formType)} · {l.email} · {l.phone}
                                </div>

                                <div className="text-xs text-gray-400 mt-1">
                                    {new Date(l.createdAt).toLocaleString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Enquiry Details */}
                {selected && (
                    <aside className="bg-white border rounded-xl p-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-semibold">Enquiry Details</h2>

                            <button
                                onClick={() => setSelected(null)}
                                className="text-gray-500 text-xl"
                                aria-label="Close enquiry details"
                            >
                                ×
                            </button>
                        </div>

                        <Detail label="Form" value={getFormTypeLabel(selected.formType)} />
                        <Detail label="Name" value={selected.name} />
                        <Detail label="Email" value={selected.email} />
                        <Detail label="Phone" value={selected.phone} />

                        {getAdditionalFields(selected).map(([key, value]) => (
                            <Detail
                                key={key}
                                label={formatLabel(key)}
                                value={formatValue(value)}
                            />
                        ))}

                        <div>
                            <div className="text-xs text-gray-500">Message</div>
                            <div className="text-sm mt-1 break-words whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                                {selected.message || "—"}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">Submitted At</div>
                            <div className="text-sm mt-0.5">
                                {new Date(selected.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div className="pt-2 border-t">
                            <label className="text-xs text-gray-500">Lead Status</label>
                            <select
                                value={selected.status}
                                onChange={e => status(selected.id, e.target.value)}
                                className="w-full border rounded-lg p-2 text-sm mt-1"
                            >
                                <option value="NEW">New</option>
                                <option value="CONTACTED">Contacted</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                    </aside>
                )}
            </div>
        </AdminShell>
    );
}

function Detail({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="text-sm mt-0.5 break-words">{value || "—"}</div>
        </div>
    );
}
