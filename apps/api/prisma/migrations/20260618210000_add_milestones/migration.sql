-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED',
    "targetDate" DATE,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "milestoneId" TEXT;

-- CreateIndex
CREATE INDEX "milestones_userId_idx" ON "milestones"("userId");
CREATE INDEX "milestones_userId_spaceId_idx" ON "milestones"("userId", "spaceId");
CREATE INDEX "tasks_milestoneId_idx" ON "tasks"("milestoneId");

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "milestones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
