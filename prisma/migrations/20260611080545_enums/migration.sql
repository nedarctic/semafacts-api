-- CreateEnum
CREATE TYPE "AttachmentUploader" AS ENUM ('Reporter', 'Handler');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('Reporter', 'Handler');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('New', 'InReview', 'Investigation', 'Resolved', 'Closed');

-- CreateEnum
CREATE TYPE "ReporterType" AS ENUM ('Anonymous', 'Confidential');
