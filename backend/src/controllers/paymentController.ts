import type { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getPayrollReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const completedJobs = await prisma.job.findMany({
      where: { status: "COMPLETED" },
      include: { reporter: true },
    });

    const TARIF_REPORTER_PER_MENIT = 2000; // IDR 2000/mins
    const TARIF_EDITOR_FLAT = 50000; // IDR 50000/mins

    let totalPayoutSistem = 0;

    const perJobEarnings = completedJobs.map((job) => {
      const reporterEarnings = job.duration * TARIF_REPORTER_PER_MENIT;
      const editorEarnings = TARIF_EDITOR_FLAT;
      const totalJobCost = reporterEarnings + editorEarnings;

      totalPayoutSistem += totalJobCost;

      return {
        jobId: job.id,
        caseName: job.caseName,
        duration: `${job.duration} mins`,
        locationType: job.locationType,
        reporterName: job.reporter?.name || "Unknown Reporter",
        earnings: {
          reporterShare: reporterEarnings,
          editorShare: editorEarnings,
          totalPerJob: totalJobCost,
        },
      };
    });

    res.status(200).json({
      totalPayout: totalPayoutSistem,
      perJobEarnings: perJobEarnings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
