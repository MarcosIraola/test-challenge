import type { ColumnsConfig } from "./types";

const COLUMN_LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  document: "Document",
  cv_zonajobs: "CV Zonajobs",
  cv_bumeran: "CV Bumeran",
  phone: "Phone",
  email: "Email",
  date: "Date",
  age: "Age",
  has_university: "University",
  career: "Career",
  graduated: "Graduated",
  courses_approved: "Courses Approved",
  location: "Location",
  accepts_working_hours: "Accepts Working Hours",
  desired_salary: "Desired Salary",
  had_interview: "Had Interview",
  reason: "Reason"
};

export function getColumnLabel(key: string): string {
  if (COLUMN_LABELS[key]) return COLUMN_LABELS[key];
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function getVisibleColumnKeys(columns: ColumnsConfig): string[] {
  return Object.entries(columns)
    .filter(([, visible]) => visible)
    .map(([key]) => key);
}
