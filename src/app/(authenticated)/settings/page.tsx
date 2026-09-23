"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Bell, Building2, CheckCircle2, ChevronRight, CircleUserRound, Landmark, LockKeyhole, ShieldCheck, Upload } from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type {
  KycStatus,
  MeResponse,
  NotificationChannel,
  NotificationPreferences,
  WalletResponse,
} from "@/features/dashboard/types";
import { Button } from "@/components/ui/button";

const settingsSections = [
  { id: "profile", label: "Profile", icon: CircleUserRound },
  { id: "account", label: "Account", icon: Building2 },
  { id: "security", label: "Security", icon: LockKeyhole },
  { id: "kyc", label: "KYC / Verification", icon: ShieldCheck },
  { id: "notifications", label: "Notifications", icon: Bell },
] as const;

type SettingsSection = (typeof settingsSections)[number]["id"];

function isSettingsSection(value: string | null): value is SettingsSection {
  return settingsSections.some((section) => section.id === value);
}

function displayStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const color = normalized === "active" || normalized === "verified" || normalized === "approved"
    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
    : normalized === "pending"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${color}`}>{displayStatus(status)}</span>;
}

function DetailRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:grid-cols-[minmax(9rem,0.7fr)_minmax(0,1.3fr)] sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function ContentCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

/**
 * There is no password-change or 2FA endpoint on the server. A form is not
 * offered here because submitting one could never succeed, and asking for a
 * current password that is never sent anywhere is worse than saying so.
 */
function SecuritySection() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Security</h2>
        <p className="mt-1 text-sm text-slate-600">Password and two-factor settings are not available yet.</p>
      </div>

      <ContentCard title="Change password" description="This account does not support changing your password from the app yet.">
        <p className="text-sm text-slate-600">Password changes are not exposed by the API in this version, so they cannot be made here.</p>
      </ContentCard>

      <ContentCard title="Two-factor authentication" description="Additional security features are not available in this phase.">
        <p className="text-sm text-slate-600">Two-factor authentication will be available in a future update.</p>
      </ContentCard>
    </div>
  );
}

/**
 * Mirrors `KYC_UPLOAD_CONFIG` on the server. A wider `image/*` filter would let
 * the browser offer formats the upload validator rejects.
 */
const DOCUMENT_ACCEPT = ".jpg,.jpeg,.png,.pdf";
const SELFIE_ACCEPT = ".jpg,.jpeg,.png";

/**
 * The server refuses a new upload while a request is pending or already
 * verified, so the form is only offered when a submission can succeed.
 */
function canSubmitKyc(status: string) {
  return status !== "PENDING" && status !== "VERIFIED";
}

function KycSection({ profile, onStatusChange }: { profile: MeResponse | null; onStatusChange: (status: KycStatus) => void }) {
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleKycSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!documentFile || !selfieFile) {
      setError("Both KYC document and selfie are required.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await dashboardApi.uploadKycDocuments(documentFile, selfieFile);

      setDocumentFile(null);
      setSelfieFile(null);
      setSuccess("Documents submitted. Your verification is now under review.");
      onStatusChange(result.status);
    } catch (submitError: unknown) {
      setError(submitError instanceof Error ? submitError.message : "Failed to upload KYC documents");
    } finally {
      setSubmitting(false);
    }
  };

  const kycStatus = profile?.kyc.status ?? "Unknown";
  const kycTier = profile?.kyc.tier ?? "Unknown";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">KYC / Verification</h2>
        <p className="mt-1 text-sm text-slate-600">Submit your identity document and a selfie to have your account verified.</p>
      </div>

      <ContentCard title="Current verification status" description="Your current KYC status and tier level.">
        <dl>
          <DetailRow label="KYC status" value={<StatusPill status={kycStatus} />} />
          <DetailRow label="KYC tier" value={displayStatus(kycTier)} />
        </dl>
      </ContentCard>

      {kycStatus === "PENDING" && (
        <ContentCard title="Verification in review" description="Your submitted documents are being reviewed.">
          <p className="text-sm text-slate-600">You cannot submit new documents while a review is in progress.</p>
        </ContentCard>
      )}

      {canSubmitKyc(kycStatus) && (
        <ContentCard title="Upload verification documents" description="JPG, PNG or PDF for your document and JPG or PNG for your selfie. Maximum 5 MB each.">
          <form onSubmit={handleKycSubmit} className="space-y-4">
            <div>
              <label htmlFor="kyc-document" className="mb-1.5 block text-sm font-medium text-slate-700">Identity document (KTP/Passport)</label>
              <div className="flex items-center gap-3">
                <label htmlFor="kyc-document" className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <Upload className="h-4 w-4" />
                  Choose file
                </label>
                <span className="min-w-0 truncate text-sm text-slate-600">{documentFile ? documentFile.name : "No file selected"}</span>
              </div>
              <input id="kyc-document" type="file" accept={DOCUMENT_ACCEPT} onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} className="sr-only" />
            </div>

            <div>
              <label htmlFor="kyc-selfie" className="mb-1.5 block text-sm font-medium text-slate-700">Selfie with document</label>
              <div className="flex items-center gap-3">
                <label htmlFor="kyc-selfie" className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <Upload className="h-4 w-4" />
                  Choose file
                </label>
                <span className="min-w-0 truncate text-sm text-slate-600">{selfieFile ? selfieFile.name : "No file selected"}</span>
              </div>
              <input id="kyc-selfie" type="file" accept={SELFIE_ACCEPT} onChange={(event) => setSelfieFile(event.target.files?.[0] ?? null)} className="sr-only" />
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div role="status" className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Button type="submit" disabled={submitting} className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800">
              {submitting ? "Uploading..." : "Submit verification"}
            </Button>
          </form>
        </ContentCard>
      )}
    </div>
  );
}

const notificationChannels: Array<{ id: NotificationChannel; label: string; description: string }> = [
  { id: "inApp", label: "In-app", description: "Show notifications inside the app." },
  { id: "email", label: "Email", description: "Send notifications to your registered email address." },
  { id: "push", label: "Push", description: "Send push notifications to your devices." },
];

function NotificationsSection() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingChannel, setSavingChannel] = useState<NotificationChannel | null>(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    dashboardApi
      .getNotificationPreferences()
      .then(setPreferences)
      .catch((requestError: unknown) =>
        setLoadError(requestError instanceof Error ? requestError.message : "Unable to load notification preferences"),
      )
      .finally(() => setLoading(false));
  }, []);

  const toggleChannel = async (channel: NotificationChannel) => {
    if (!preferences) return;

    setSaveError("");
    setSavingChannel(channel);

    try {
      /**
       * The server returns the stored row, so the response replaces local state
       * rather than the optimistic value being kept.
       */
      const updated = await dashboardApi.updateNotificationPreferences({
        [channel]: !preferences[channel],
      });

      setPreferences(updated);
    } catch (requestError: unknown) {
      setSaveError(requestError instanceof Error ? requestError.message : "Failed to update notification preferences");
    } finally {
      setSavingChannel(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Notifications</h2>
        <p className="mt-1 text-sm text-slate-600">Choose how you want to be notified about account activity.</p>
      </div>

      <ContentCard title="Delivery channels" description="Changes are saved as soon as you switch a channel.">
        {loading ? (
          <div className="space-y-3" aria-hidden>
            {notificationChannels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-56 animate-pulse rounded bg-slate-100" />
                </div>
                <div className="h-6 w-11 shrink-0 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : loadError || !preferences ? (
          <div className="space-y-3">
            <div role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{loadError || "Notification preferences are unavailable."}</span>
            </div>
            <Button type="button" onClick={() => window.location.reload()} className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800">
              Try again
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {notificationChannels.map(({ id, label, description }) => {
              const enabled = preferences[id];

              return (
                <div key={id} className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">{label}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{description}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    aria-label={`${label} notifications`}
                    disabled={savingChannel !== null}
                    onClick={() => toggleChannel(id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-60 ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? "left-[1.375rem]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}

            {saveError && (
              <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}
          </div>
        )}
      </ContentCard>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<MeResponse | null>(null);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const section = useMemo<SettingsSection>(() => {
    const requested = searchParams?.get("section") ?? null;
    return isSettingsSection(requested) ? requested : "profile";
  }, [searchParams]);
  const currentSection = settingsSections.find((item) => item.id === section) ?? settingsSections[0];

  useEffect(() => {
    Promise.all([dashboardApi.getMe(), dashboardApi.getWallet()])
      .then(([profileResponse, walletResponse]) => {
        setProfile(profileResponse);
        setWallet(walletResponse);
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to load settings"))
      .finally(() => setLoading(false));
  }, [router]);

  const selectSection = (nextSection: SettingsSection) => {
    router.push(nextSection === "profile" ? "/settings" : `/settings?section=${nextSection}`);
  };

  /**
   * A successful upload moves KYC to PENDING, so the status shown here is
   * refreshed from the upload response instead of requiring a reload.
   */
  const applyKycStatus = useCallback((status: KycStatus) => {
    setProfile((current) => (current ? { ...current, kyc: { ...current.kyc, status } } : current));
  }, []);

  if (loading) {
    return <div className="flex flex-1 items-center justify-center bg-white text-slate-700">Loading settings...</div>;
  }

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "Not provided";
  const accountStatus = profile?.account.isActive ? "Active" : "Inactive";
  const emailStatus = profile?.account.isEmailVerified ? "Verified" : "Unverified";

  return (
    <div className="flex flex-1 flex-col bg-[#ededed]">
      <main className="min-w-0 flex-1 bg-white px-4 py-5 sm:px-6 sm:py-6">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">Settings</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800">Account settings</h1>
          </div>

          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
            <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Settings sections">
              <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:flex-col lg:overflow-visible">
                <p className="hidden px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 lg:block">Settings</p>
                {settingsSections.map(({ id, label, icon: Icon }) => {
                  const active = id === section;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectSection(id)}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="min-w-0">
              <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
                <span>Settings</span><ChevronRight className="h-4 w-4" /><span className="font-medium text-slate-800">{currentSection.label}</span>
              </div>

              {error ? (
                <div role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>
              ) : section === "profile" ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Profile</h2>
                    <p className="mt-1 text-sm text-slate-600">Your personal information is shown from your authenticated profile.</p>
                  </div>
                  <ContentCard title="Personal information" description="These details are read-only in this version of Settings.">
                    <dl>
                      <DetailRow label="Full name" value={fullName} />
                      <DetailRow label="Email address" value={profile?.email ?? "Not provided"} />
                      <DetailRow label="Phone number" value={profile?.phoneNumber || "Not provided"} />
                    </dl>
                  </ContentCard>
                  <ContentCard title="Verification" description="Current verification information from your profile.">
                    <dl>
                      <DetailRow label="Email verification" value={<StatusPill status={emailStatus} />} />
                      <DetailRow label="KYC status" value={<StatusPill status={profile?.kyc.status ?? "Unknown"} />} />
                      <DetailRow label="KYC tier" value={displayStatus(profile?.kyc.tier ?? "Unknown")} />
                    </dl>
                  </ContentCard>
                </div>
              ) : section === "account" ? (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">Account</h2>
                    <p className="mt-1 text-sm text-slate-600">A read-only overview of your authenticated account and wallet status.</p>
                  </div>
                  <ContentCard title="Account status" description="Status values are provided by your authenticated profile and wallet.">
                    <dl>
                      <DetailRow label="Account" value={<StatusPill status={accountStatus} />} />
                      <DetailRow label="Email verification" value={<StatusPill status={emailStatus} />} />
                      <DetailRow label="Wallet" value={<StatusPill status={wallet?.isFrozen ? "Frozen" : "Active"} />} />
                    </dl>
                  </ContentCard>
                  <ContentCard title="Verification level" description="The KYC level currently associated with your account.">
                    <dl>
                      <DetailRow label="KYC status" value={<StatusPill status={profile?.kyc.status ?? "Unknown"} />} />
                      <DetailRow label="KYC tier" value={displayStatus(profile?.kyc.tier ?? "Unknown")} />
                    </dl>
                  </ContentCard>
                </div>
              ) : section === "security" ? (
                <SecuritySection />
              ) : section === "kyc" ? (
                <KycSection profile={profile} onStatusChange={applyKycStatus} />
              ) : section === "notifications" ? (
                <NotificationsSection />
              ) : (
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><Landmark className="h-5 w-5" /></div>
                  <h2 className="mt-4 text-xl font-semibold text-slate-800">{currentSection.label}</h2>
                  <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">This section is not available in Settings yet. No preferences or account changes can be made here in this phase.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
