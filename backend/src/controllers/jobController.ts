import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseName, duration, locationType, jobLocation } = req.body;

    if (!caseName || !duration || !locationType) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    if (locationType === "PHYSICAL" && !jobLocation) {
      res.status(400).json({ error: "Physical jobs require a jobLocation" });
      return;
    }

    const newJob = await prisma.job.create({
      data: {
        caseName,
        duration: Number(duration),
        locationType,
        jobLocation: locationType === "REMOTE" ? null : jobLocation,
        status: "NEW",
      },
    });

    res.status(201).json(newJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const assignReporter = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params["id"];
    const { reporterId } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid or missing Job ID" });
      return;
    }

    if (!reporterId) {
      res.status(400).json({ error: "Reporter ID is required" });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    // if (
    //   job.status === "TRANSCRIBED" ||
    //   job.status === "REVIEWED" ||
    //   job.status === "COMPLETED"
    // ) {
    //   res.status(400).json({
    //     error: `Cannot change reporter. This job is already in '${job.status}' stage.`,
    //   });
    //   return;
    // }

    if (job.status !== "NEW") {
      res
        .status(400)
        .json({
          error: "Reporter can only be assigned when the job status is NEW.",
        });
      return;
    }

    const reporter = await prisma.user.findUnique({
      where: { id: reporterId },
    });
    if (!reporter || reporter.role !== "REPORTER") {
      res.status(404).json({ error: "Reporter not found or invalid role" });
      return;
    }

    if (!reporter.isAvailable) {
      res.status(400).json({ error: "Reporter is currently unavailable" });
      return;
    }

    if (job.locationType === "PHYSICAL") {
      if (job.jobLocation?.toLowerCase() !== reporter.location.toLowerCase()) {
        res.status(400).json({
          error: `Location mismatch. Job is in ${job.jobLocation}, but reporter is in ${reporter.location}.`,
        });
        return;
      }
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        reporterId: reporter.id,
        status: "ASSIGNED",
      },
      include: { reporter: true },
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitTranscription = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params["id"];
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid or missing Job ID" });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (job.status !== "ASSIGNED") {
      res.status(400).json({
        error: "Job must be in ASSIGNED status to submit transcription",
      });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: { status: "TRANSCRIBED" },
    });

    res.status(200).json({
      message: "Transcription submitted successfully",
      job: updatedJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const assignEditor = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params["id"];
    const { editorId } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid or missing Job ID" });
      return;
    }

    if (!editorId) {
      res.status(400).json({ error: "Editor ID is required" });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    // Cukup pakai satu guard ini saja untuk urusan status:
    if (job.status !== "TRANSCRIBED") {
      res.status(400).json({
        error: `Cannot assign editor. Job must be in 'TRANSCRIBED' stage, but current status is '${job.status}'.`,
      });
      return;
    }

    const editor = await prisma.user.findUnique({ where: { id: editorId } });
    if (!editor || editor.role !== "EDITOR") {
      res.status(404).json({ error: "Valid Editor not found" });
      return;
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        editorId: editor.id,
        status: "REVIEWED",
      },
      include: { editor: true },
    });

    res
      .status(200)
      .json({ message: "Editor assigned successfully", job: updatedJob });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const approveJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params["id"];
    const { action } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid or missing Job ID" });
      return;
    }

    if (action !== "APPROVE" && action !== "REJECT") {
      res.status(400).json({ error: "Action must be APPROVE or REJECT" });
      return;
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    if (job.status !== "REVIEWED") {
      res
        .status(400)
        .json({ error: "Job must be under REVIEWED status to be approved" });
      return;
    }

    const newStatus = action === "APPROVE" ? "COMPLETED" : "ASSIGNED";

    const updateData =
      action === "APPROVE"
        ? { status: newStatus }
        : { status: newStatus, editorId: null };

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: { reporter: true, editor: true },
    });

    res.status(200).json({
      message: `Job has been successfully ${action === "APPROVE" ? "approved" : "rejected (returned to reporter)"}`,
      job: updatedJob,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllJobs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        reporter: true,
        editor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params["id"];

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid or missing Job ID" });
      return;
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        reporter: true,
        editor: true,
      },
    });

    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    res.status(200).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
