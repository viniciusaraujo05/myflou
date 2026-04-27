CREATE TABLE "tasks" (
    "id"        TEXT         NOT NULL,
    "userId"    TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "date"      DATE         NOT NULL,
    "completed" BOOLEAN      NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tasks_userId_idx" ON "tasks"("userId");
CREATE INDEX "tasks_userId_date_idx" ON "tasks"("userId", "date");

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
