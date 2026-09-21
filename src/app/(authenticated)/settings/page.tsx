"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Bell, Building2, CheckCircle2, ChevronRight, CircleUserRound, Landmark, LockKeyhole, ShieldCheck, Upload } from "lucide-react";

import { dashboardApi } from "@/features/dashboard/api";
import type { MeResponse, WalletResponse } from "@/features/dashboard/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError("Password change API not yet implemented. Backend integration required.");
    setSubmitting(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Security</h2>
        <p className="mt-1 text-sm text-slate-600">Manage your password and account security settings.</p>
      </div>

      <ContentCard title="Change password" description="Update your account password. All password fields are required.">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-slate-700">Current password</label>
            <Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter current password" className="h-11" />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-700">New password</label>
            <Input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Enter new password" className="h-11" />
            <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters.</p>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm new password</label>
            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm new password" className="h-11" />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800">
            {submitting ? "Updating..." : "Update password"}
          </Button>
        </form>
      </ContentCard>

      <ContentCard title="Two-factor authentication" description="Additional security features are not available in this phase.">
        <p className="text-sm text-slate-600">Two-factor authentication will be available in a future update.</p>
      </ContentCard>
    </div>
  );
}

function KycSection({ profile }: { profile: MeResponse | null }) {
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
    setError("KYC upload API not yet implemented. Backend integration required.");
    setSubmitting(false);
  };

  const kycStatus = profile?.kyc.status ?? "PENDING";
  const kycTier = profile?.kyc.tier ?? "TIER_0";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">KYC / Verification</h2>
        <p className="mt-1 text-sm text-slate-600">Upload verification documents to increase your account limits.</p>
      </div>

      <ContentCard title="Current verification status" description="Your current KYC status and tier level.">
        <dl>
          <DetailRow label="KYC status" value={<StatusPill status={kycStatus} />} />
          <DetailRow label="KYC tier" value={displayStatus(kycTier)} />
        </dl>
      </ContentCard>

      {kycStatus !== "APPROVED" && (
        <ContentCard title="Upload verification documents" description="Submit your identity document and selfie for verification.">
          <form onSubmit={handleKycSubmit} className="space-y-4">
            <div>
              <label htmlFor="kyc-document" className="mb-1.5 block text-sm font-medium text-slate-700">Identity document (KTP/Passport)</label>
              <div className="flex items-center gap-3">
                <label htmlFor="kyc-document" className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <Upload className="h-4 w-4" />
                  Choose file
                </label>
                <span className="text-sm text-slate-600">{documentFile ? documentFile.name : "No file selected"}</span>
              </div>
              <input id="kyc-document" type="file" accept="image/*,.pdf" onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)} className="sr-only" />
            </div>

            <div>
              <label htmlFor="kyc-selfie" className="mb-1.5 block text-sm font-medium text-slate-700">Selfie with document</label>
              <div className="flex items-center gap-3">
                <label htmlFor="kyc-selfie" className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300">
                  <Upload className="h-4 w-4" />
                  Choose file
                </label>
                <span className="text-sm text-slate-600">{selfieFile ? selfieFile.name : "No file selected"}</span>
              </div>
              <input id="kyc-selfie" type="file" accept="image/*" onChange={(event) => setSelfieFile(event.target.files?.[0] ?? null)} className="sr-only" />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
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

      <ContentCard title="Verification benefits" description="Higher tiers unlock increased transaction limits.">
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span className="font-semibold text-slate-800">Tier 0:</span> Limited features</li>
          <li className="flex gap-2"><span className="font-semibold text-slate-800">Tier 1:</span> Standard limits</li>
          <li className="flex gap-2"><span className="font-semibold text-slate-800">Tier 2:</span> Increased limits</li>
          <li className="flex gap-2"><span className="font-semibold text-slate-800">Tier 3:</span> Maximum limits</li>
        </ul>
      </ContentCard>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Notifications</h2>
        <p className="mt-1 text-sm text-slate-600">Notification preferences are not yet available.</p>
      </div>

      <ContentCard title="Notification backend unavailable" description="Notification functionality requires backend API integration.">
        <p className="text-sm text-slate-600">The notification system is not yet implemented. This section will allow you to configure email and push notification preferences once the backend API is available.</p>
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
    if (!localStorage.getItem("accessToken")) {
      router.replace("/");
      return;
    }

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

  if (loading) {
    return <div className="flex flex-1 items-center justify-center bg-white text-slate-700">Loading settings...</div>;
  }

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "Not provided";
  const accountStatus = profile?.account.isActive ? "Active" : "Inactive";
  const emailStatus = profile?.account.isEmailVerified ? "Verified" : "Unverified";

  return (
    <div className="flex flex-1 flex-col bg-[#ededed] grayscale">
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
                <KycSection profile={profile} />
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
