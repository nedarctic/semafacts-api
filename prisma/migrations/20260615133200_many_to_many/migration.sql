-- DropForeignKey
ALTER TABLE "incident_handlers" DROP CONSTRAINT "incident_handlers_incidentId_fkey";

-- CreateTable
CREATE TABLE "_IncidentToIncidentHandler" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_IncidentToIncidentHandler_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_IncidentToIncidentHandler_B_index" ON "_IncidentToIncidentHandler"("B");

-- AddForeignKey
ALTER TABLE "_IncidentToIncidentHandler" ADD CONSTRAINT "_IncidentToIncidentHandler_A_fkey" FOREIGN KEY ("A") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IncidentToIncidentHandler" ADD CONSTRAINT "_IncidentToIncidentHandler_B_fkey" FOREIGN KEY ("B") REFERENCES "incident_handlers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
