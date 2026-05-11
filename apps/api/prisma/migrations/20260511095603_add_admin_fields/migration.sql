-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "totpSecretEnc" TEXT,
    "hasTotp" BOOLEAN NOT NULL DEFAULT false,
    "failedLogins" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "lastLoginAt" DATETIME,
    "lastLoginIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedReason" TEXT,
    "bannedAt" DATETIME
);
INSERT INTO "new_User" ("createdAt", "displayName", "email", "emailNormalized", "emailVerified", "failedLogins", "hasTotp", "id", "lastLoginAt", "lastLoginIp", "lockedUntil", "passwordHash", "totpSecretEnc", "updatedAt") SELECT "createdAt", "displayName", "email", "emailNormalized", "emailVerified", "failedLogins", "hasTotp", "id", "lastLoginAt", "lastLoginIp", "lockedUntil", "passwordHash", "totpSecretEnc", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");
CREATE INDEX "User_emailNormalized_idx" ON "User"("emailNormalized");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
