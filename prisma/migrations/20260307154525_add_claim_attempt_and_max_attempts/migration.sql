/*
  Warnings:

  - A unique constraint covering the columns `[itemId,claimantId]` on the table `ClaimRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "maxAttempts" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "ClaimAttempt" (
    "id" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "claimId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimRequest_itemId_claimantId_key" ON "ClaimRequest"("itemId", "claimantId");

-- AddForeignKey
ALTER TABLE "ClaimAttempt" ADD CONSTRAINT "ClaimAttempt_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
