"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/AdminShell";
import { api } from "@/lib/api";

type TrackingSettings = {
    enabled: boolean;
    headCode: string;
    bodyStartCode: string;
    bodyEndCode: string;
};

const DEFAULT_SETTINGS: TrackingSettings = {
    enabled: true,
    headCode: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y560F8W6VL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-Y560F8W6VL');
</script>`,
    bodyStartCode: "",
    bodyEndCode: "",
};

export default function SettingsPage() {
    const [settings, setSettings] =
        useState<TrackingSettings>(DEFAULT_SETTINGS);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await api("/settings/tracking");

                setSettings({
                    enabled: data.enabled ?? true,
                    headCode: data.headCode ?? "",
                    bodyStartCode: data.bodyStartCode ?? "",
                    bodyEndCode: data.bodyEndCode ?? "",
                });
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load settings"
                );
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    function updateField(
        field: keyof TrackingSettings,
        value: string | boolean
    ) {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));

        setMessage("");
        setError("");
    }

    async function saveSettings() {
        setSaving(true);
        setMessage("");
        setError("");

        try {
            const result = await api("/settings/tracking", {
                method: "PUT",
                body: JSON.stringify(settings),
            });

            setMessage(
                result.message || "Settings saved successfully."
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to save settings"
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <AdminShell>
                <p className="text-sm text-gray-500">
                    Loading tracking settings...
                </p>
            </AdminShell>
        );
    }

    return (
        <AdminShell>
            <div className="max-w-5xl">
                <div className="mb-7">
                    <h1 className="text-2xl font-semibold text-[#052e26]">
                        Tracking & Scripts
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Manage Google Analytics, Google Tag Manager,
                        Meta Pixel and custom website scripts.
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Tracking Scripts
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Enable or disable all tracking scripts on the
                                public website.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                updateField("enabled", !settings.enabled)
                            }
                            className={`rounded-full px-5 py-2 text-sm font-medium ${settings.enabled
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                        >
                            {settings.enabled ? "Enabled" : "Disabled"}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <CodeField
                        title="Head Code"
                        description="Added inside the website's HTML head. Use this for Google Analytics, GTM scripts and verification meta tags."
                        value={settings.headCode}
                        onChange={(value) =>
                            updateField("headCode", value)
                        }
                        placeholder="Paste your head code here..."
                    />

                    <CodeField
                        title="Body Start Code"
                        description="Added immediately after the opening body tag. Use this for Google Tag Manager noscript snippets and other body-start scripts."
                        value={settings.bodyStartCode}
                        onChange={(value) =>
                            updateField("bodyStartCode", value)
                        }
                        placeholder="Paste your body start code here..."
                    />

                    <CodeField
                        title="Body End Code"
                        description="Added near the end of the body, before the closing body tag. Use this for custom scripts and other tracking integrations."
                        value={settings.bodyEndCode}
                        onChange={(value) =>
                            updateField("bodyEndCode", value)
                        }
                        placeholder="Paste your body end code here..."
                    />
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="text-sm font-semibold text-amber-900">
                        Important security note
                    </h3>

                    <p className="mt-1 text-sm text-amber-800">
                        Only add tracking code from trusted providers.
                        These fields can execute JavaScript on your public
                        website. Changes should only be made by authorized
                        administrators.
                    </p>
                </div>

                {message && (
                    <div className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="mt-7 flex justify-end">
                    <button
                        type="button"
                        onClick={saveSettings}
                        disabled={saving}
                        className="rounded-lg bg-[#052e26] px-7 py-3 text-sm font-medium text-white hover:bg-[#0a4539] disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </AdminShell>
    );
}

function CodeField({
    title,
    description,
    value,
    onChange,
    placeholder,
}: {
    title: string;
    description: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 md:p-6">
            <h2 className="font-semibold text-gray-900">
                {title}
            </h2>

            <p className="mt-1 mb-4 text-sm text-gray-500">
                {description}
            </p>

            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                spellCheck={false}
                rows={9}
                className="w-full rounded-lg border border-gray-300 bg-[#111827] p-4 font-mono text-xs leading-6 text-green-300 outline-none focus:border-[#052e26] focus:ring-1 focus:ring-[#052e26]"
            />
        </div>
    );
}