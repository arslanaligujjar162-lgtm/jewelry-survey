"use client";

import { useEffect } from "react";
import { installClientErrorReporting } from "@/lib/monitoring";

export function ErrorReportingInit() {
  useEffect(() => {
    installClientErrorReporting();
  }, []);
  return null;
}
