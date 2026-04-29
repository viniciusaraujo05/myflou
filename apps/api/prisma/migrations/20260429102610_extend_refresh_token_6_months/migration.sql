-- Add columns as nullable first, backfill existing rows, then enforce NOT NULL

ALTER TABLE "refresh_tokens"
  ADD COLUMN "absoluteExpiresAt" TIMESTAMP(3),
  ADD COLUMN "family"            TEXT;

-- Backfill: existing tokens get absoluteExpiresAt = expiresAt (they will expire naturally),
-- and a unique family UUID so each orphaned token forms its own family.
UPDATE "refresh_tokens"
SET
  "absoluteExpiresAt" = "expiresAt",
  "family"            = gen_random_uuid()::TEXT
WHERE "absoluteExpiresAt" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "refresh_tokens"
  ALTER COLUMN "absoluteExpiresAt" SET NOT NULL,
  ALTER COLUMN "family"            SET NOT NULL;

-- CreateIndex
CREATE INDEX "refresh_tokens_family_idx" ON "refresh_tokens"("family");
