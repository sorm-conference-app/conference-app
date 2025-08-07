import { supabase } from "@/constants/supabase";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to fetch the survey link based on current timestamp
 * Finds the most recent survey that has started and is either:
 * 1. Has no end time (shows indefinitely)
 * 2. Still within the active timeframe (start <= now <= end)
 * @returns Query result with survey link data
 */
export function useSurveyLink() {
    return useQuery({
        queryKey: ["survey-link"],
        queryFn: async () => {
            // Get current timestamp in ISO format
            const now = new Date().toISOString();

            //console.log("Checking surveys at:", now);

            // Get all surveys that have started, ordered by start time descending (most recent first)
            const { data: surveys, error } = await supabase
                .from("survey_links")
                .select("id, survey_start_time, survey_end_time, survey_link")
                .lte("survey_start_time", now) // Survey has started
                .order("survey_start_time", { ascending: false }); // Most recent first

            if (error) {
                console.error("Error fetching surveys:", error);
                throw error;
            }

            if (!surveys || surveys.length === 0) {
                //console.log("No surveys have started yet");
                return null;
            }

            // Find the active survey
            for (const survey of surveys) {
                // If no end time, show indefinitely
                if (!survey.survey_end_time) {
                    //console.log("Found active survey with no end time:", survey.id);
                    return survey.survey_link;
                }

                // If there's an end time, check if we're still within the timeframe
                if (survey.survey_end_time && now <= survey.survey_end_time) {
                    //console.log("Found active survey within timeframe:", survey.id);
                    return survey.survey_link;
                }

                // If this survey has ended, check if it's the most recent one that started
                // If so, it means no newer survey has started yet, so we don't show any survey
                //console.log("Survey has ended:", survey.id, "ended at:", survey.survey_end_time);
            }

            //console.log("No active surveys found");
            return null;
        },
        // Refetch every 2 minutes to check for new surveys or time changes
        refetchInterval: 2 * 60 * 1000,
        // Cache for 30 seconds to balance responsiveness with performance
        staleTime: 30 * 1000,
    });
} 