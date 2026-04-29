"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const prisma = new client_1.PrismaClient();
function readJson(rel) {
    const file = path.join(__dirname, 'seed-data', rel);
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}
async function main() {
    const datasets = ['verbs.json', 'nouns.json', 'flashcards.json', 'sheets.json'];
    for (const f of datasets) {
        try {
            const data = readJson(f);
            console.log(`✓ ${f}: ${Array.isArray(data) ? data.length : 'object'} records`);
        }
        catch (err) {
            console.warn(`! ${f} not found or invalid:`, err.message);
        }
    }
    console.log('Seed verification complete. Add real seeders here as content tables ship.');
}
main()
    .catch((err) => {
    console.error(err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map