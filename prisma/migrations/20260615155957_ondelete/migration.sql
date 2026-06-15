-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_incidentId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_incidentId_fkey";

-- DropForeignKey
ALTER TABLE "SecretCode" DROP CONSTRAINT "SecretCode_incidentId_fkey";

-- AddForeignKey
ALTER TABLE "SecretCode" ADD CONSTRAINT "SecretCode_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
