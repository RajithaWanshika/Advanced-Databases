# Advanced-Databases

Coursework for **CMM702 Advanced Databases** (IIT / MSc): **Section A** (modelling diagrams), **Section 2** (external-sorting plot), and **Section B** (click logging with Firebase/PHP/MongoDB, plus **`books.json`** MongoDB labs).

## Repository layout

| Path | Contents |
|------|----------|
| `section A/Question 1/` | Conceptual / logical diagrams (e.g. MHS), images and PDF |
| `section 2/` | `graphs.py` — passes vs file size **N** for external sort (**B = 3**); optional output image |
| `section B/Q2/clicklogs/` | Click-logging web app (`index.html`, `index.css`), PHP (`saveTaps.php`), Firebase/Firestore config |
| `section B/Q2/clicklogs/scripts/` | Node export: Firestore **`tap_logs`** → MongoDB (`export-firestore-to-mongo.mjs`) |
| `section B/Q2/clicklogs/scripts/README.md` | **Question 2** brief + MongoDB analytics (4a–c) |
| `section B/Q2/clicklogs/scripts/cmd.txt` | One-line aggregations (same ideas as `scripts/README.md`) |
| `section B/Q3/README.md` | **Question 3** brief + requirement-mapped **`mongoimport` / `mongosh`** commands |
| `section B/Q3/cmd.txt` | Compact **`mongoimport`** and query one-liners |
| `books.json` | Books dataset for MongoDB import (Question 3) |
| `clicklogs.zip` | Original bundled click-logging starter (reference) |
| `CMM702 Advanced Databases Assessment-2026.pdf` | Module assessment brief (if present locally) |
| `LICENSE` | Repository license |

## Assessment alignment

- **Question 2 [LO2, LO3, LO4]** — `saveTaps.php`, Firestore **`tap_logs`**, hosting (e.g. GitHub Pages), MongoDB analytics. Brief + single-query aggregations: [`section B/Q2/clicklogs/scripts/README.md`](section%20B/Q2/clicklogs/scripts/README.md).
- **Question 3 [LO4]** — load **`books.json`** into **`iitdb.books`**, eight requirements (one query each), screenshots and viva. Commands: [`section B/Q3/README.md`](section%20B/Q3/README.md).

## Section 2 — External sort plot (`graphs.py`)

Uses **matplotlib**. On macOS, use a **virtual environment** (system Python is often PEP 668–locked):

```bash
cd "section 2"
python3 -m venv .venv
.venv/bin/pip install matplotlib
.venv/bin/python graphs.py
```

Virtual environment directories (`.venv/`, `venv/`) are **gitignored**; recreate on each machine as needed.

## Section B — Q2: Click logging

- **Front end:** UI sends tap batches to your backend.
- **Backend:** PHP (`saveTaps.php`) → **Firestore** (`firebase-config.php`).
- **Config:** `firebase.json`, `firestore.indexes.json`, etc.

### Export Firestore → MongoDB

From `section B/Q2/clicklogs/scripts/`:

```bash
npm install
npm run export
```

Configure `section B/Q2/clicklogs/.env` (gitignored). Typical variables:

| Variable | Purpose |
|----------|---------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to Firebase **service account** JSON (gitignored: `*firebase-adminsdk*.json`) |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | Database name |
| `MONGODB_COLLECTION` | Collection (e.g. `tap_logs`) |
| `MONGODB_USERNAME` / `MONGODB_PASSWORD` | Optional if not in URI |
| `MONGODB_AUTH_SOURCE` | Optional; default `admin` when using user/password |

The script **upserts** into MongoDB on `firestoreId`.

**Analytics:** [`section B/Q2/clicklogs/scripts/README.md`](section%20B/Q2/clicklogs/scripts/README.md) or `cmd.txt` one-liners.

## Section B — Q3: MongoDB (`books`)

1. Full walkthrough: **`section B/Q3/README.md`**. Shortcuts: **`section B/Q3/cmd.txt`**.
2. Import example (adjust URI and credentials; run from directory containing `books.json` or use an absolute `--file` path):

   ```bash
   mongoimport --uri "mongodb+srv://<cluster>/<dbname>" --username <user> --password <pass> \
     --collection books --file books.json
   ```

### Notes for category aggregations

- After **`$unwind: "$categories"`**, each **`bookCount`** is how often that category appears on **published** books. **Sums of those counts are not total books** — one book with three categories adds one to three buckets. Use **`countDocuments({ status: "PUBLISH" })`** for book totals.
- **`"Internet"`** vs **`"internet"`** are different group keys unless you normalize (e.g. **`$toLower`** / **`$trim`**) before **`$group`**, or merge with **`$in: ["Internet", "internet"]`** in a sub-pipeline.

## Security

Do **not** commit secrets. **`.gitignore`** excludes `.env`, clicklogs `data/`, `*firebase-adminsdk*.json`, and common venv folders.

## Requirements (overview)

- **Section 2:** Python 3.10+ recommended, **matplotlib** in a venv.
- **Q2 export:** Node.js 18+, `npm` deps in `section B/Q2/clicklogs/scripts/package.json`.
- **Q2 PHP/Firebase:** PHP + Firebase project (rules/indexes as required).
- **Q3:** **`mongosh`**, **`mongoimport`** (MongoDB Database Tools), MongoDB or Atlas.
