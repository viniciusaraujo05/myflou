-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "folders" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "notes" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "link_categories" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "links" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "credentials" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "transactions" ADD COLUMN "spaceId" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN "spaceId" TEXT;

-- CreateIndex
CREATE INDEX "spaces_userId_idx" ON "spaces"("userId");
CREATE INDEX "tasks_userId_spaceId_idx" ON "tasks"("userId", "spaceId");
CREATE INDEX "folders_userId_spaceId_idx" ON "folders"("userId", "spaceId");
CREATE INDEX "notes_userId_spaceId_idx" ON "notes"("userId", "spaceId");
CREATE INDEX "link_categories_userId_spaceId_idx" ON "link_categories"("userId", "spaceId");
CREATE INDEX "links_userId_spaceId_idx" ON "links"("userId", "spaceId");
CREATE INDEX "credentials_userId_spaceId_idx" ON "credentials"("userId", "spaceId");
CREATE INDEX "transactions_userId_spaceId_idx" ON "transactions"("userId", "spaceId");
CREATE INDEX "subscriptions_userId_spaceId_idx" ON "subscriptions"("userId", "spaceId");

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "folders" ADD CONSTRAINT "folders_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notes" ADD CONSTRAINT "notes_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "link_categories" ADD CONSTRAINT "link_categories_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "links" ADD CONSTRAINT "links_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: give every existing user a default "Personal" space and migrate
-- all of their existing resources into it (so nothing lands in the Inbox on launch).
INSERT INTO "spaces" ("id", "userId", "name", "color", "order", "archived", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, u."id", 'Personal', '#6366f1', 0, false, now(), now()
FROM "users" u;

UPDATE "tasks" r           SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "folders" r         SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "notes" r           SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "link_categories" r SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "links" r           SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "credentials" r     SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "transactions" r    SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
UPDATE "subscriptions" r   SET "spaceId" = s."id" FROM "spaces" s WHERE s."userId" = r."userId" AND s."name" = 'Personal';
