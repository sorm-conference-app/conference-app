export interface Event {
  id: number;
  created_at: string;
  title: string;
  start_time: string;
  end_time: string;
  location: string;
  description: string | null;
  type: string | null;
  speaker: string | null;
  slides_url: string | null;
  speaker_name: string | null;
  speaker_title: string | null;
  speaker_bio: string | null;
  event_date: string;
} 