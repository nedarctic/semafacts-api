/*
  Warnings:

  - You are about to drop the column `mimetype` on the `Attachment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "mimetype",
ADD COLUMN     "mimeType" TEXT;
