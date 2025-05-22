export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
};

// This would typically come from an API or database
export const announcements: Announcement[] = [
  {
    id: "1",
    title: "Welcome to the Symposium!",
    body: "We're excited to have you join us for the SORM Symposium. Please check the agenda for today's schedule.",
    date: "August 13, 2024",
  },
  {
    id: "2",
    title: "Lunch Location Update",
    body: "Today's lunch will be served in the Main Hall instead of the previously announced location.",
    date: "August 13, 2024",
  },
]; 