-- CreateTable
CREATE TABLE "time_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spaceId" TEXT,
    "taskId" TEXT,
    "note" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "time_sessions_userId_idx" ON "time_sessions"("userId");
CREATE INDEX "time_sessions_userId_startedAt_idx" ON "time_sessions"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "time_sessions" ADD CONSTRAINT "time_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "time_sessions" ADD CONSTRAINT "time_sessions_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "time_sessions" ADD CONSTRAINT "time_sessions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
