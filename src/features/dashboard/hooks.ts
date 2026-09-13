"use client";

import { useEffect, useState } from "react";

import { dashboardApi } from "@/features/dashboard/api";
import type { DashboardResponse } from "@/features/dashboard/types";

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await dashboardApi.getDashboard();
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return { data, loading, error };
}
