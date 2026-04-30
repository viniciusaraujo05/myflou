-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN "rotated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "RefreshToken" ADD COLUMN "rotatedAt" TIMESTAMP(3);
