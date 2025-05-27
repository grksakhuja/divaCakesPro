import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface FeatureFlags {
  templates: {
    showTemplateSection: boolean;
    enableTemplateApi: boolean;
    enableTemplateSeeding: boolean;
  };
}

export function useFeatureFlags() {
  const { data: featureFlags, isLoading, error } = useQuery({
    queryKey: ["/api/feature-flags"],
    queryFn: async () => {
      const response = await apiRequest("/api/feature-flags", "GET");
      return response.json() as Promise<FeatureFlags>;
    },
    // Cache for 5 minutes to avoid excessive requests
    staleTime: 5 * 60 * 1000,
    // Don't refetch on window focus for feature flags
    refetchOnWindowFocus: false,
  });

  return {
    featureFlags: featureFlags || {
      templates: {
        showTemplateSection: false,
        enableTemplateApi: false,
        enableTemplateSeeding: false,
      },
    },
    isLoading,
    error,
  };
} 