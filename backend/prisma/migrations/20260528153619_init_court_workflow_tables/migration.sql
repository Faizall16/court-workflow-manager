-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REPORTER', 'EDITOR');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('PHYSICAL', 'REMOTE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('NEW', 'ASSIGNED', 'TRANSCRIBED', 'REVIEWED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "location" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "caseName" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "jobLocation" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'NEW',
    "reporterId" TEXT,
    "editorId" TEXT,
    "reporterFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "editorFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPayout" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
