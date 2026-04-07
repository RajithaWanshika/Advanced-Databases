# Question 2 [LO2, LO3, LO4] — Click logs → Firestore → MongoDB

## Brief (assessment)

You are given a **web-based click logging** system (see `clicklogs.zip` / this folder). It captures timing data across **device types** and **interface** variations:

- User picks **device type** (Android / PC).
- System randomly assigns **feedback mode** (mean duration shown or not).
- User taps up to **50** times per **session**.
- Data captured per tap: timing (**start/end**, **duration**), **sequence**, **interface** variant, **session id**, **device platform**.
- Two interface variations: **feedback** vs **no-feedback**.

The original bundle was missing **`saveTaps.php`**; implementation starts there (or an equivalent backend).

**Tasks**

1. **Backend:** Implement **`saveTaps.php`** (or another backend) to accept **POST** tap payloads. Each record should include at least:
   - Tap **sequence** number  
   - **Start** and **end** timestamps  
   - **Interface type** (feedback / no-feedback)  
   - **Session** identifier  
   - **Device platform**  

2. **Firestore:** Ingest each tap into collection **`tap_logs`**. In your write-up, address:
   - **(a)** Which fields should be **indexed** for efficient querying?  
   - **(b)** How you model the link between **session** and **individual taps** (e.g. shared `sessionId` on each tap document).  
   - **(c)** Whether **duration** is **stored** or **derived** in queries (trade-off: read cost vs storage/consistency).  

3. **Sharing:** Host the UI (e.g. **GitHub Pages**) and collect data from colleagues / multiple devices.

4. **MongoDB (after export):** With enough test data, answer **in single queries each**:
   - **(a)** Mean tap duration **Android vs PC**  
   - **(b)** Mean tap duration **`feedbackshown` vs `nofeedback`**  
   - **(c)** How many users **completed both** interface variations vs **dropped after the first**  

**LO2 / LO3 / LO4:** integration, data design, and analytical queries.

---

## Implementation pointers (this repo)

| Piece | Location |
|--------|-----------|
| POST handler + Firestore writes | `../saveTaps.php`, `../firebase-config.php` |
| Front end | `../index.html`, `../index.css` |
| Firestore rules / indexes | `../firebase.json`, `../firestore.indexes.json` |
| Export Firestore → MongoDB | `export-firestore-to-mongo.mjs` (`npm run export`), `.env` |

---

## Part 4 — MongoDB commands (`tap_logs`)

Run in **`mongosh`** on the database/collection used after export (default collection name **`tap_logs`**). Field names match typical exports: `devicePlatform`, `durationMs`, `interfaceType`, `interfaceSequence`, `sessionId`.

### 4a. Mean tap duration: Android vs PC

```javascript
db.tap_logs.aggregate([
  { $match: { devicePlatform: { $in: ["android", "pc"] } } },
  {
    $group: {
      _id: "$devicePlatform",
      meanDurationMs: { $avg: "$durationMs" },
      tapCount: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
])
```

### 4b. Mean tap duration: `feedbackshown` vs `nofeedback`

```javascript
db.tap_logs.aggregate([
  { $match: { interfaceType: { $in: ["feedbackshown", "nofeedback"] } } },
  {
    $group: {
      _id: "$interfaceType",
      meanDurationMs: { $avg: "$durationMs" },
      tapCount: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
])
```

### 4c. Sessions that completed both variations vs dropped after the first

Here “both variations” is implemented as sessions whose **maximum** `interfaceSequence` is **≥ 2** (first block vs second block); “dropped after first” is **max sequence less than 2**.

```javascript
db.tap_logs.aggregate([
  {
    $group: {
      _id: "$sessionId",
      maxSeq: { $max: "$interfaceSequence" },
    },
  },
  {
    $group: {
      _id: null,
      completedBoth: {
        $sum: { $cond: [{ $gte: ["$maxSeq", 2] }, 1, 0] },
      },
      droppedAfterFirst: {
        $sum: { $cond: [{ $lt: ["$maxSeq", 2] }, 1, 0] },
      },
      totalSessions: { $sum: 1 },
    },
  },
])
```

---

*Source: `cmd.txt` in this folder — same pipelines, expanded for readability.*
