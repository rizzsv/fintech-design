import { Check, Mail, X } from "lucide-react";

/**
 * Envelope + badge mark used on the email verification screens, matching the
 * line-art illustration in the design reference (docs/design/email-sending-notif.png).
 */
export function MailVerificationArt({ variant = "check" }: { variant?: "check" | "alert" }) {
  const BadgeIcon = variant === "check" ? Check : X;

  return (
    <div aria-hidden className="relative h-[96px] w-[132px] md:h-[113px] md:w-[154px]">
      <Mail
        strokeWidth={1.4}
        className="absolute bottom-0 left-0 h-[84px] w-[84px] text-foreground md:h-[98px] md:w-[98px]"
      />

      <span className="absolute left-[55px] top-[4px] flex h-[44px] w-[44px] items-center justify-center rounded-full bg-foreground md:left-[64px] md:top-[5px] md:h-[52px] md:w-[52px]">
        <BadgeIcon strokeWidth={2.6} className="h-[22px] w-[22px] text-white md:h-[26px] md:w-[26px]" />
      </span>

      <svg
        viewBox="0 0 40 36"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        className="absolute right-0 top-0 h-[31px] w-[34px] text-foreground md:h-[36px] md:w-[40px]"
      >
        <path d="M4 22 L12 3" />
        <path d="M13 30 L31 11" />
        <path d="M21 35 L38 28" />
      </svg>
    </div>
  );
}
