-- CreateTable
CREATE TABLE "CommonWordMastery" (
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "wordId"),
    CONSTRAINT "CommonWordMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "CommonWordMastery_userId_idx" ON "CommonWordMastery"("userId");
