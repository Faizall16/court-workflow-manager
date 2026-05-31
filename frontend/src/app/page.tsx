"use client";

import { useEffect, useState } from "react";
import { jobServices, reportServices, userServices } from "@/lib/api-services";
import { Job, User, PayrollReportResponse } from "@/types";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payroll, setPayroll] = useState<PayrollReportResponse | null>(null);
  const [reporters, setReporters] = useState<User[]>([]);
  const [editors, setEditors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newJobForm, setNewJobForm] = useState({
    caseName: "",
    duration: "" as number | "",
    locationType: "REMOTE" as "REMOTE" | "PHYSICAL",
    jobLocation: "",
  });

  // Fetching all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsData, payrollData, reportersData, editorsData] =
        await Promise.all([
          jobServices.getAllJobs(),
          reportServices.getPayrollReport(),
          userServices.getUsers("REPORTER"),
          userServices.getUsers("EDITOR"),
        ]);
      setJobs(jobsData);
      setPayroll(payrollData);
      setReporters(reportersData);
      setEditors(editorsData);
    } catch (error) {
      console.error("Failed to fetch data from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle create job
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newJobForm.duration === "") {
      toast.warning("Job duration field is required!");
      return;
    }

    try {
      await jobServices.createJob({
        caseName: newJobForm.caseName,
        locationType: newJobForm.locationType,
        jobLocation: newJobForm.jobLocation,
        duration: Number(newJobForm.duration),
      });

      setIsCreateOpen(false);
      setNewJobForm({
        caseName: "",
        duration: "",
        locationType: "REMOTE",
        jobLocation: "",
      });
      fetchData();
      toast.success("New case registered!");
    } catch (error: any) {
      toast.warning(
        error.response?.data?.error || "Failed to create new case!",
      );
    }
  };

  // Handle assign reporter
  const handleAssignStaff = async () => {
    if (!selectedJobId || !selectedStaffId) return;
    const currentJob = jobs.find((j) => j.id === selectedJobId);
    if (!currentJob) return;

    try {
      if (currentJob.status === "NEW" || currentJob.status === "ASSIGNED") {
        await jobServices.assignReporter(selectedJobId, selectedStaffId);
        toast.success("Reporter assigned to this case.");
      } else if (currentJob.status === "TRANSCRIBED") {
        await jobServices.assignEditor(selectedJobId, selectedStaffId);
        toast.success("Editor assigned to audit this case.");
      }
      setIsAssignOpen(false);
      setSelectedStaffId("");
      fetchData();
    } catch (error: any) {
      toast.warning(
        error.response?.data?.error || "Failed assigned staff to this case!",
      );
    }
  };

  const handleAction = async (
    id: string,
    actionType: "submit" | "approve" | "reject",
  ) => {
    try {
      if (actionType === "submit") {
        await jobServices.submitTranscription(id);
        toast.success("Successed send this transcript to editor!");
      } else if (actionType === "approve") {
        await jobServices.approveJob(id, "APPROVE");
        toast.success("Case completed!.");
      } else if (actionType === "reject") {
        await jobServices.approveJob(id, "REJECT");
        toast.warning("Case rejected and send back to reporter.");
      }
      fetchData();
    } catch (error: any) {
      toast.warning(error.response?.data?.error || "Action failed!");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 hover:bg-blue-100"
          >
            NEW
          </Badge>
        );
      case "ASSIGNED":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-700 hover:bg-amber-100"
          >
            ASSIGNED
          </Badge>
        );
      case "TRANSCRIBED":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 hover:bg-purple-100"
          >
            TRANSCRIBED
          </Badge>
        );
      case "REVIEWED":
        return (
          <Badge
            variant="secondary"
            className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
          >
            UNDER REVIEW
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          >
            COMPLETED
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm font-medium text-slate-500">
        Memuat data sistem...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-10 font-sans antialiased">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Court Reporting Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Manage audio transcripts, staff resource assignment, and automatic
              payload calculations.
            </p>
          </div>

          {/* Create case */}
          <Dialog
            open={isCreateOpen}
            onOpenChange={(open) => {
              setIsCreateOpen(open);
              if (!open) {
                setNewJobForm({
                  caseName: "",
                  duration: "",
                  locationType: "REMOTE",
                  jobLocation: "",
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all duration-200">
                + Register New Case
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Case Registration Form</DialogTitle>
                <DialogDescription>
                  Input all required metadata for the court proceeding below.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateJob} className="space-y-4 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Case / Hearing Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Civil Dispute Hearing A vs B"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={newJobForm.caseName}
                    onChange={(e) =>
                      setNewJobForm({ ...newJobForm, caseName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Audio Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g., 60"
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                    value={newJobForm.duration}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewJobForm({
                        ...newJobForm,
                        duration: val === "" ? "" : Number(val),
                      });
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Location Strategy
                  </label>
                  <Select
                    value={newJobForm.locationType}
                    onValueChange={(val: any) =>
                      setNewJobForm({
                        ...newJobForm,
                        locationType: val,
                        jobLocation:
                          val === "REMOTE" ? "" : newJobForm.jobLocation,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">Remote (Online)</SelectItem>
                      <SelectItem value="PHYSICAL">
                        Physical (On-site)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newJobForm.locationType === "PHYSICAL" && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Target City Location
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Jakarta or Bandung"
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                      value={newJobForm.jobLocation}
                      onChange={(e) =>
                        setNewJobForm({
                          ...newJobForm,
                          jobLocation: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  Save Case Record
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* All metric */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Total System Payout
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">
                Rp {payroll?.totalPayout?.toLocaleString("id-ID") || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                Accumulated payroll expenditures disbursed for COMPLETED cases.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Completed Cases
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {jobs.filter((j) => j.status === "COMPLETED").length}{" "}
                <span className="text-sm font-normal text-slate-400">jobs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                Total number of transcript assets successfully verified by an
                Editor.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 shadow-sm bg-white sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Active Pipeline
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {
                  jobs.filter(
                    (j) => j.status !== "COMPLETED" && j.status !== "NEW",
                  ).length
                }{" "}
                <span className="text-sm font-normal text-slate-400">
                  in-queue
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">
                Tasks currently pending transcript drafting or editorial review
                audits.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">
              Case Delegation Registry
            </CardTitle>
            <CardDescription className="text-xs">
              Monitor running workflow lifecycle logs in real time.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/70">
                  <TableRow>
                    <TableHead className="w-[250px] font-semibold text-slate-700">
                      Case Reference
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Duration
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Type / Venue
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Lifecycle State
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Reporter
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Editor
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">
                      Workflow Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-sm text-slate-400"
                      >
                        No registered cases discovered in current database
                        bounds.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow
                        key={job.id}
                        className="hover:bg-slate-50/40 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900">
                          {job.caseName}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {job.duration} Mins
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {job.locationType === "PHYSICAL"
                            ? `🏢 ${job.jobLocation}`
                            : "💻 Remote"}
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {job.reporter?.name || (
                            <span className="text-slate-300 italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {job.editor?.name || (
                            <span className="text-slate-300 italic">
                              Unassigned
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {/* Delegate reporter */}
                          {(job.status === "NEW" ||
                            job.status === "ASSIGNED") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-slate-200"
                              onClick={() => {
                                setSelectedJobId(job.id);
                                setIsAssignOpen(true);
                              }}
                            >
                              {job.status === "ASSIGNED"
                                ? "Reassign Reporter"
                                : "Assign Reporter"}
                            </Button>
                          )}

                          {/* Submit transcript */}
                          {job.status === "ASSIGNED" && (
                            <Button
                              size="sm"
                              className="ml-2 text-xs bg-indigo-600 text-white hover:bg-indigo-500"
                              onClick={() => handleAction(job.id, "submit")}
                            >
                              Submit Transcript
                            </Button>
                          )}

                          {/* Delegate editor */}
                          {job.status === "TRANSCRIBED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                              onClick={() => {
                                setSelectedJobId(job.id);
                                setIsAssignOpen(true);
                              }}
                            >
                              Assign Editor
                            </Button>
                          )}

                          {/* Review/Approve */}
                          {job.status === "REVIEWED" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                className="text-xs bg-emerald-600 text-white hover:bg-emerald-500"
                                onClick={() => handleAction(job.id, "approve")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                                onClick={() => handleAction(job.id, "reject")}
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          {/* Completed */}
                          {job.status === "COMPLETED" && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                              🔒 Locked
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Staff assign */}
        <Dialog
          open={isAssignOpen}
          onOpenChange={(open) => {
            setIsAssignOpen(open);
            if (!open) {
              setSelectedStaffId("");
              setSelectedJobId(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Team Member Delegation</DialogTitle>
              <DialogDescription>
                Select an authenticated staff teammate to move this pipeline
                forward.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Team Member Name
                </label>
                <Select
                  value={selectedStaffId}
                  onValueChange={setSelectedStaffId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Available Personnel --" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.find((j) => j.id === selectedJobId)?.status ===
                    "TRANSCRIBED"
                      ? editors.map((e) => (
                          <SelectItem key={e.id} value={e.id}>
                            {e.name} (Editor)
                          </SelectItem>
                        ))
                      : reporters.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} ({r.location}) -{" "}
                            {r.isAvailable ? "Available" : "Busy"}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleAssignStaff}
              >
                Confirm Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
