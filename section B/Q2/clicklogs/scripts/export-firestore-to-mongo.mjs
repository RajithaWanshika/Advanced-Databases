import { readFileSync, existsSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { MongoClient } from "mongodb";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clicklogsRoot = join(__dirname, "..");

dotenv.config({ path: join(clicklogsRoot, ".env") });

const repoRoot = resolve(clicklogsRoot, "..", "..", "..");

function getServiceAccountPath(raw) {
	if (!raw) {
		return null;
	}
	const trimmed = String(raw).trim().replace(/^["']|["']$/g, "");
	const paths = [
		trimmed,
		resolve(clicklogsRoot, trimmed),
		resolve(repoRoot, trimmed),
		resolve(clicklogsRoot, basename(trimmed)),
		join(__dirname, basename(trimmed)),
		join(clicklogsRoot, "scripts", basename(trimmed)),
	];
	for (const p of paths) {
		if (p && existsSync(p)) {
			return p;
		}
	}
	return null;
}

function firestoreValueToPlain(v) {
	if (v === null || v === undefined) return v;
	if (typeof v.toDate === "function") return v.toDate();
	if (v instanceof Buffer) return v;
	if (Array.isArray(v)) return v.map(firestoreValueToPlain);
	if (typeof v === "object") {
		const out = {};
		for (const [k, val] of Object.entries(v)) {
			out[k] = firestoreValueToPlain(val);
		}
		return out;
	}
	return v;
}

function loadServiceAccount() {
	const p = getServiceAccountPath(process.env.GOOGLE_APPLICATION_CREDENTIALS);
	if (p) {
		return JSON.parse(readFileSync(p, "utf8"));
	}
	throw new Error(
		"cannot find GOOGLE_APPLICATION_CREDENTIALS in the environment variables"
	);
}

const mongoUri = process.env.MONGODB_URI?.trim();
const mongoDbName = process.env.MONGODB_DB?.trim();
const mongoCollection = process.env.MONGODB_COLLECTION?.trim();
const mongoUsername = process.env.MONGODB_USERNAME?.trim();
const mongoPassword = process.env.MONGODB_PASSWORD ?? "";

const mongoClientOptions = {};
if (mongoUsername) {
	mongoClientOptions.auth = {
		username: mongoUsername,
		password: mongoPassword,
	};
	mongoClientOptions.authSource =
		process.env.MONGODB_AUTH_SOURCE?.trim() || "admin";
}

const sa = loadServiceAccount();
if (!admin.apps.length) {
	admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const firestore = admin.firestore();
const snap = await firestore.collection("tap_logs").get();
const batch = snap.docs.map((doc) => {
	const data = firestoreValueToPlain(doc.data());
	return { firestoreId: doc.id, ...data };
});

if (batch.length === 0) {
	console.log("No documents in tap_logs.");
	process.exit(0);
}

const client = new MongoClient(mongoUri, mongoClientOptions);
await client.connect();
const col = client.db(mongoDbName).collection(mongoCollection);
const ops = batch.map((doc) => ({
	updateOne: {
		filter: { firestoreId: doc.firestoreId },
		update: { $set: doc },
		upsert: true,
	},
}));
const result = await col.bulkWrite(ops, { ordered: false });
console.log(
	"tap_logs:",
	mongoDbName + "." + mongoCollection,
	"| matched:",
	result.matchedCount,
	"modified:",
	result.modifiedCount,
	"upserted:",
	result.upsertedCount
);
await client.close();
process.exit(0);
