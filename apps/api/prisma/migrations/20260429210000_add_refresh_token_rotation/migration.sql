-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "rotated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "rotatedAt" TIMESTAMP(3);
