export type Announcement = {
  id: string;
  title: string;
  body: string;
};

// This would typically come from an API or database
export const announcements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to the Symposium!",
    body: "We're excited to have you join us for the SORM Symposium. Please check the agenda for today's schedule.",
  },
  {
    id: "2",
    title: "Lunch Location Update",
    body: "Today's lunch will be served in the Main Hall instead of the previously announced location.",
  },
  {
    id: "3",
    title: "Keynote Speaker Announced",
    body: "We're excited to announce that Dr. John Smith will be our keynote speaker. He will be speaking on the topic of 'The Future of SORM'.",
  },
]; 