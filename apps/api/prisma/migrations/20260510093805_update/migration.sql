/*
  Warnings:

  - You are about to alter the column `darkMode` on the `UserPreference` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `flashcardMode` on the `UserPreference` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.
  - You are about to alter the column `hideMastered` on the `UserPreference` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPreference" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "flashcardMode" BOOLEAN NOT NULL DEFAULT false,
    "hideMastered" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserPreference" ("darkMode", "flashcardMode", "hideMastered", "updatedAt", "userId") SELECT "darkMode", "flashcardMode", "hideMastered", "updatedAt", "userId" FROM "UserPreference";
DROP TABLE "UserPreference";
ALTER TABLE "new_UserPreference" RENAME TO "UserPreference";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
