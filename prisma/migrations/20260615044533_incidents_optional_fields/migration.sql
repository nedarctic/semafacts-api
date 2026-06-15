-- AlterTable
ALTER TABLE "Incident" ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "location" DROP NOT NULL,
ALTER COLUMN "incidentDate" DROP NOT NULL,
ALTER COLUMN "reporterType" SET DEFAULT 'Anonymous',
ALTER COLUMN "status" SET DEFAULT 'New';
