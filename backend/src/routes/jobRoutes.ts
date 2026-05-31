import { Router } from "express";
import {
  createJob,
  assignReporter,
  submitTranscription,
  assignEditor,
  approveJob,
  getAllJobs,
  getJobById,
} from "../controllers/jobController.js";
import { getPayrollReport } from "../controllers/paymentController.js";
import { getUsers } from "../controllers/userController.js";

const router: Router = Router();

// Get jobs
router.get("/jobs", getAllJobs);
router.get("/jobs/:id", getJobById);

// All Flow
router.post("/jobs", createJob);
router.patch("/jobs/:id/assign-reporter", assignReporter);
router.patch("/jobs/:id/submit-transcription", submitTranscription);
router.patch("/jobs/:id/assign-editor", assignEditor);
router.patch("/jobs/:id/approve", approveJob);

// Payroll
router.get("/reports/payroll", getPayrollReport);

// User
router.get("/users", getUsers);
export default router;
