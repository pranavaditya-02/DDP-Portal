export interface StudentNavItem {
  label: string;
  slug: string;
}

export const studentNavItems: StudentNavItem[] = [
  { label: "Student Achievements", slug: "student-achievements" },
  { label: "Activity Master", slug: "activity-master" },
  { label: "Activity Logger", slug: "activity-logger" },
  { label: "Paper Presentation Report", slug: "paper-presentation-report" },
  { label: "Project Competition Report", slug: "project-competition-report" },
  { label: "Competition Report", slug: "competition-report" },
  { label: "MBA Technical Competition", slug: "mba-technical-competition" },
  { label: "Patent Report", slug: "patent-report" },
  { label: "Patent Tracker", slug: "patent-tracker" },
  { label: "Internship", slug: "internship" },
  { label: "Internship Tracker", slug: "internship-tracker" },
  { label: "Internship Report", slug: "internship-report" },
  { label: "Product", slug: "product" },
  { label: "Online Course", slug: "online-course" },
  { label: "Journal Publication", slug: "journal-publication" },
  { label: "Non-Technical", slug: "non-technical" },
  { label: "Book Chapter Publication", slug: "book-chapter-publication" },
  {
    label: "Technical Body Membership",
    slug: "technical-body-membership",
  },
  { label: "Excellence Awards", slug: "excellence-awards" },
  { label: "Career Plan", slug: "career-plan" },
  {
    label: "Student Technical Event Masters",
    slug: "student-technical-event-masters",
  },
  { label: "Student Idea Submission", slug: "student-idea-submission" },
];

export const getStudentItemBySlug = (slug: string) =>
  studentNavItems.find((item) => item.slug === slug);
