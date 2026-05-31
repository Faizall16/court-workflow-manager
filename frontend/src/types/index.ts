export type UserRole = "REPORTER" | "EDITOR";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  location: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type JobStatus =
  | "NEW"
  | "ASSIGNED"
  | "TRANSCRIBED"
  | "REVIEWED"
  | "COMPLETED";
export type LocationType = "PHYSICAL" | "REMOTE";

export interface Job {
  id: string;
  caseName: string;
  duration: number;
  locationType: LocationType;
  jobLocation: string | null;
  status: JobStatus;
  reporterId: string | null;
  editorId: string | null;
  createdAt: string;
  updatedAt: string;

  reporter?: User | null;
  editor?: User | null;
}

export interface JobEarningDetail {
  reporterShare: number;
  editorShare: number;
  totalPerJob: number;
}

export interface PayrollJobItem {
  jobId: string;
  caseName: string;
  duration: string;
  locationType: LocationType;
  reporterName: string;
  earnings: JobEarningDetail;
}

export interface PayrollReportResponse {
  totalPayout: number;
  perJobEarnings: PayrollJobItem[];
}
