import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckEmailView } from "@/features/auth/components/check-email-view";

export const metadata: Metadata = {
  title: "Check your email",
};

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailView />
    </Suspense>
  );
}
