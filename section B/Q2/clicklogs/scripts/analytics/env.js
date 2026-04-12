import { readFileSync, existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import admin from "firebase-admin";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clicklogsRoot = join(__dirname, "..", "..");
const scriptsRoot = join(__dirname, "..");
const repoRoot = resolve(clicklogsRoot, "..", "..", "..");

dotenv.config({ path: join(clicklogsRoot, ".env") });

function getServiceAccountPath(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim().replace(/^["']|["']$/g, "");
  const paths = [
    trimmed,
    resolve(clicklogsRoot, trimmed),
    resolve(repoRoot, trimmed),
    join(clicklogsRoot, basename(trimmed)),
    join(scriptsRoot, basename(trimmed)),
    join(__dirname, basename(trimmed)),
  ];
  for (const p of paths) {
    if (p && existsSync(p)) return p;
  }
  return null;
}

const p = getServiceAccountPath(process.env.GOOGLE_APPLICATION_CREDENTIALS);
if (!p) {
  throw new Error("Error: Cannot find service account path");
}

const sa = JSON.parse(readFileSync(p, "utf8"));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

export const db = admin.firestore();
