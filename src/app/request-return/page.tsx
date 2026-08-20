import type { Metadata } from "next";
import { RequestReturnClient } from "@/components/returns/RequestReturnClient";

export const metadata: Metadata = {
  title: "Request a Return or Exchange",
  description: "Submit your order number and reason to start a return or exchange with 7teen2wenty.",
  alternates: { canonical: "/request-return" },
};

export default function RequestReturnPage() {
  return <RequestReturnClient />;
}
