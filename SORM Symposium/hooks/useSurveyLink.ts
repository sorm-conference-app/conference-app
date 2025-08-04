import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch the survey link for the current date
 * @returns Query result with survey link data
 */
export function useSurveyLink() {
    return useQuery({
        queryKey: ["survey-link"],
        queryFn: async () => {
            // Get current date in YYYY-MM-DD format to match Supabase date type
            const today = new Date();
            const currentDate = today.getFullYear() + '-' +
                String(today.getMonth() + 1).padStart(2, '0') + '-' +
                String(today.getDate()).padStart(2, '0');

            const { data, error } = await supabase
                .from("survey_links")
                .select("survey_link")
                .eq("survey_date", currentDate)
                .maybeSingle();

            if (error) {
                // If no survey found for today, return null instead of throwing
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }

            return data?.survey_link || null;
        },
        // Refetch every 5 minutes to check for new surveys
        refetchInterval: 5 * 60 * 1000,
        // Cache for 1 minute
        staleTime: 1 * 60 * 1000,
    });
} 