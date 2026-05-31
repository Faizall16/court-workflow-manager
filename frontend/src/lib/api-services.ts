import api from "./api";
import { Job, User, PayrollReportResponse } from "../types";

export const jobServices = {
  getAllJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>("/jobs");
    return response.data;
  },

  getJobById: async (id: string): Promise<Job> => {
    const response = await api.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (data: {
    caseName: string;
    duration: number;
    locationType: "PHYSICAL" | "REMOTE";
    jobLocation?: string;
  }): Promise<Job> => {
    const response = await api.post<Job>("/jobs", data);
    return response.data;
  },

  assignReporter: async (id: string, reporterId: string): Promise<Job> => {
    const response = await api.patch<Job>(`/jobs/${id}/assign-reporter`, {
      reporterId,
    });
    return response.data;
  },

  submitTranscription: async (
    id: string,
  ): Promise<{ message: string; job: Job }> => {
    const response = await api.patch<{ message: string; job: Job }>(
      `/jobs/${id}/submit-transcription`,
    );
    return response.data;
  },

  assignEditor: async (
    id: string,
    editorId: string,
  ): Promise<{ message: string; job: Job }> => {
    const response = await api.patch<{ message: string; job: Job }>(
      `/jobs/${id}/assign-editor`,
      { editorId },
    );
    return response.data;
  },

  approveJob: async (
    id: string,
    action: "APPROVE" | "REJECT",
  ): Promise<{ message: string; job: Job }> => {
    const response = await api.patch<{ message: string; job: Job }>(
      `/jobs/${id}/approve`,
      { action },
    );
    return response.data;
  },
};

export const userServices = {
  getUsers: async (role?: "REPORTER" | "EDITOR"): Promise<User[]> => {
    const response = await api.get<User[]>("/users", {
      params: role ? { role } : {},
    });
    return response.data;
  },
};

export const reportServices = {
  getPayrollReport: async (): Promise<PayrollReportResponse> => {
    const response = await api.get<PayrollReportResponse>("/reports/payroll");
    return response.data;
  },
};
