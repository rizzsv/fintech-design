/**
 * Resolves the inbox destination for a registered email address.
 *
 * Known consumer providers open their webmail inbox in a new tab. Anything else
 * (corporate or self-hosted domains) falls back to the `mailto:` handler, which
 * hands off to whatever mail app the device has registered.
 */
const WEBMAIL_INBOX_URLS: Record<string, string> = {
  "gmail.com": "https://mail.google.com/mail/u/0/",
  "googlemail.com": "https://mail.google.com/mail/u/0/",
  "outlook.com": "https://outlook.live.com/mail/0/",
  "outlook.co.id": "https://outlook.live.com/mail/0/",
  "hotmail.com": "https://outlook.live.com/mail/0/",
  "hotmail.co.uk": "https://outlook.live.com/mail/0/",
  "live.com": "https://outlook.live.com/mail/0/",
  "msn.com": "https://outlook.live.com/mail/0/",
  "yahoo.com": "https://mail.yahoo.com/",
  "yahoo.co.id": "https://mail.yahoo.com/",
  "ymail.com": "https://mail.yahoo.com/",
  "rocketmail.com": "https://mail.yahoo.com/",
  "aol.com": "https://mail.aol.com/",
  "icloud.com": "https://www.icloud.com/mail",
  "me.com": "https://www.icloud.com/mail",
  "mac.com": "https://www.icloud.com/mail",
  "proton.me": "https://mail.proton.me/",
  "protonmail.com": "https://mail.proton.me/",
  "pm.me": "https://mail.proton.me/",
  "zoho.com": "https://mail.zoho.com/",
  "yandex.com": "https://mail.yandex.com/",
  "yandex.ru": "https://mail.yandex.ru/",
  "gmx.com": "https://www.gmx.com/",
  "mail.com": "https://www.mail.com/",
};

export interface InboxTarget {
  url: string;
  /** Webmail opens in a new tab; the mailto fallback stays in the current one. */
  isWebmail: boolean;
}

export function resolveInboxTarget(email: string): InboxTarget {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  const webmailUrl = domain ? WEBMAIL_INBOX_URLS[domain] : undefined;

  if (webmailUrl) {
    return { url: webmailUrl, isWebmail: true };
  }

  return { url: "mailto:", isWebmail: false };
}

export function openInbox(email: string) {
  const { url, isWebmail } = resolveInboxTarget(email);

  if (isWebmail) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.href = url;
}
