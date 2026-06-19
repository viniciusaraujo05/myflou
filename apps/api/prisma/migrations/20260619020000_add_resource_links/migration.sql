-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('TASK', 'NOTE', 'LINK', 'CREDENTIAL', 'TRANSACTION', 'SUBSCRIPTION', 'MILESTONE');

-- CreateTable
CREATE TABLE "resource_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromType" "ResourceType" NOT NULL,
    "fromId" TEXT NOT NULL,
    "toType" "ResourceType" NOT NULL,
    "toId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resource_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resource_links_userId_fromType_fromId_idx" ON "resource_links"("userId", "fromType", "fromId");
CREATE INDEX "resource_links_userId_toType_toId_idx" ON "resource_links"("userId", "toType", "toId");
CREATE UNIQUE INDEX "resource_links_userId_fromType_fromId_toType_toId_key" ON "resource_links"("userId", "fromType", "fromId", "toType", "toId");

-- AddForeignKey
ALTER TABLE "resource_links" ADD CONSTRAINT "resource_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
