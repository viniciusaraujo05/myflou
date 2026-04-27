-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "statusId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "statuses" JSONB NOT NULL DEFAULT '[]';
