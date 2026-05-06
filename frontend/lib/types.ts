export type Candidate = {
  id: string;
  name?: string;
  email?: string;
  reason: string;
  [key: string]: unknown;
};

export type ColumnsConfig = Record<string, boolean>;

export type StatusFilter = "all" | "approved" | "rejected";
