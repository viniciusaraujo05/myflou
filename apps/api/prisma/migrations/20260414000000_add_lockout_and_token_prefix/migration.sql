-- AlterTable: add account lockout fields to users
ALTER TABLE "users"
  ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil"         TIMESTAMP(3);

-- AlterTable: add tokenPrefix to refresh_tokens for fast indexed lookup
ALTER TABLE "refresh_tokens"
  ADD COLUMN "tokenPrefix" TEXT NOT NULL DEFAULT '';

-- CreateIndex for prefix-based token lookup
CREATE INDEX "refresh_tokens_tokenPrefix_idx" ON "refresh_tokens"("tokenPrefix");
