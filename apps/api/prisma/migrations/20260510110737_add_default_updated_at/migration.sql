-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FlashcardProgress" (
    "userId" TEXT NOT NULL,
    "deckId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "box" INTEGER NOT NULL DEFAULT 0,
    "dueAt" DATETIME,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "deckId", "cardId"),
    CONSTRAINT "FlashcardProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FlashcardProgress" ("box", "cardId", "deckId", "dueAt", "updatedAt", "userId") SELECT "box", "cardId", "deckId", "dueAt", "updatedAt", "userId" FROM "FlashcardProgress";
DROP TABLE "FlashcardProgress";
ALTER TABLE "new_FlashcardProgress" RENAME TO "FlashcardProgress";
CREATE INDEX "FlashcardProgress_userId_dueAt_idx" ON "FlashcardProgress"("userId", "dueAt");
CREATE TABLE "new_MasteryEntry" (
    "userId" TEXT NOT NULL,
    "sheetSlug" TEXT NOT NULL,
    "mastered" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "sheetSlug"),
    CONSTRAINT "MasteryEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MasteryEntry" ("mastered", "sheetSlug", "updatedAt", "userId") SELECT "mastered", "sheetSlug", "updatedAt", "userId" FROM "MasteryEntry";
DROP TABLE "MasteryEntry";
ALTER TABLE "new_MasteryEntry" RENAME TO "MasteryEntry";
CREATE TABLE "new_NounMastery" (
    "userId" TEXT NOT NULL,
    "nounId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "nounId"),
    CONSTRAINT "NounMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_NounMastery" ("nounId", "updatedAt", "userId") SELECT "nounId", "updatedAt", "userId" FROM "NounMastery";
DROP TABLE "NounMastery";
ALTER TABLE "new_NounMastery" RENAME TO "NounMastery";
CREATE INDEX "NounMastery_userId_idx" ON "NounMastery"("userId");
CREATE TABLE "new_VerbMastery" (
    "userId" TEXT NOT NULL,
    "verbId" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "verbId"),
    CONSTRAINT "VerbMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VerbMastery" ("updatedAt", "userId", "verbId") SELECT "updatedAt", "userId", "verbId" FROM "VerbMastery";
DROP TABLE "VerbMastery";
ALTER TABLE "new_VerbMastery" RENAME TO "VerbMastery";
CREATE INDEX "VerbMastery_userId_idx" ON "VerbMastery"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
