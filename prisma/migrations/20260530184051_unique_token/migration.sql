/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `InviteToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_tokenHash_key" ON "InviteToken"("tokenHash");
