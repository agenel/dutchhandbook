-- CreateTable
CREATE TABLE "VerbMastery" (
    "userId" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "verbId"),
    CONSTRAINT "VerbMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NounMastery" (
    "userId" TEXT NOT NULL,
    "nounId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "nounId"),
    CONSTRAINT "NounMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VerbMastery_userId_idx" ON "VerbMastery"("userId");

-- CreateIndex
CREATE INDEX "NounMastery_userId_idx" ON "NounMastery"("userId");
