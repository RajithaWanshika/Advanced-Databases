# Advanced-Databases

Coursework and exercises for **CMM702 Advanced Databases** (IIT / MSc). This repository holds **Section B** practical work: a click-logging stack (Firebase, PHP, MongoDB) and MongoDB query/import material for the books dataset.

## Repository layout

| Path | Contents |
|------|----------|
| `section B/Q2/clicklogs/` | Click-logging web app (`index.html`, `index.css`), PHP backend (`saveTaps.php`), Firebase/Firestore config |
| `section B/Q2/clicklogs/scripts/` | Node script to export Firestore `tap_logs` → MongoDB |
| `section B/Q2/clicklogs/scripts/README.md` | **Q2** brief + MongoDB commands for analytics (4a–c) |
| `section B/Q2/clicklogs/scripts/cmd.txt` | One-line aggregations (same content as `section B/Q2/clicklogs/scripts/README.md`) |
| `section B/Q3/README.md` | **Q3** brief + requirement-mapped **`mongoimport` / `mongosh`** commands |
| `section B/Q3/cmd.txt` | Compact **`mongoimport`** and query one-liners |
| `books.json` | Sample books dataset for MongoDB import (used with Q3) |
| `CMM702 Advanced Databases Assessment-2026.pdf` | Module assessment brief (if present locally) |

## Assessment alignment

- **Question 2 [LO2, LO3, LO4]** — click logging: `saveTaps.php`, Firestore **`tap_logs`**, hosting (e.g. GitHub Pages), MongoDB analytics. Full brief and **single-query** aggregations for parts 4a–c: [`section B/Q2/clicklogs/scripts/README.md`](section%20B/Q2/clicklogs/scripts/README.md).
- **Question 3 [LO4]** — load **`books.json`** into **`iitdb.books`**, eight numbered requirements (one query each), screenshots in your submission. Commands mapped to each requirement: [`section B/Q3/README.md`](section%20B/Q3/README.md).

## Section B — Q2: Click logging

- **Front end:** static UI records taps and sends data to your backend.
- **Backend:** PHP (`saveTaps.php`) writes to **Firestore** (see `firebase-config.php`).
- **Firebase:** project settings in `firebase.json`, `firestore.indexes.json`, etc. Deploy or run locally according to your hosting setup.

### Export Firestore → MongoDB

From `section B/Q2/clicklogs/scripts/`:

```bash
npm install
npm run export
```

Configure `section B/Q2/clicklogs/.env` (file is gitignored). Typical variables:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase **service account** JSON (also gitignored by pattern `*firebase-adminsdk*.json`) |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `MONGODB_COLLECTION` | Collection name (e.g. `tap_logs`) |
| `MONGODB_USERNAME` / `MONGODB_PASSWORD` | Optional; if your URI does not embed credentials |
| `MONGODB_AUTH_SOURCE` | Optional; defaults to `admin` when using username/password |

The script reads all documents from the Firestore collection **`tap_logs`** and **upserts** them into MongoDB (matched on `firestoreId`).

**Analytics:** see [`section B/Q2/clicklogs/scripts/README.md`](section%20B/Q2/clicklogs/scripts/README.md) (assessment wording + queries) or `cmd.txt` for one-liners.

## Section B — Q3: MongoDB (`books`)

1. Follow **`section B/Q3/README.md`** for Question 3 requirements 1–8 (load + queries + aggregations) and submission notes (screenshots, viva).
2. Quick import example (adjust URI and credentials):

   ```bash
   mongoimport --uri "mongodb+srv://<cluster>/<dbname>" --username <user> --password <pass> \
     --collection books --file books.json
   ```

3. **`section B/Q3/cmd.txt`** holds compact copies of the same commands.

## Security

Do **not** commit secrets. This repo’s `.gitignore` excludes `.env` files, local `data/` under clicklogs, and `*firebase-adminsdk*.json` service account keys. Use your own credentials on each machine.

## Requirements (overview)

- **Q2 export script:** Node.js 18+ recommended, `npm` dependencies in `scripts/package.json`.
- **Q2 PHP/Firebase:** PHP runtime + Firebase project (Firestore rules and indexes as required).
- **Q3:** `mongosh` / `mongoimport` (MongoDB Database Tools) and a MongoDB instance or Atlas cluster.
