/*
  Warnings:

  - You are about to drop the `_IncidentToIncidentHandler` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_IncidentToIncidentHandler" DROP CONSTRAINT "_IncidentToIncidentHandler_A_fkey";

-- DropForeignKey
ALTER TABLE "_IncidentToIncidentHandler" DROP CONSTRAINT "_IncidentToIncidentHandler_B_fkey";

-- DropTable
DROP TABLE "_IncidentToIncidentHandler";

-- AddForeignKey
ALTER TABLE "incident_handlers" ADD CONSTRAINT "incident_handlers_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
