# Question 3 [LO4] — `books` in MongoDB

Use the dataset **`books.json`** (repository root) and a MongoDB instance (e.g. Atlas).

## Brief (assessment)

- Create database **`iitdb`**, collection **`books`**, and load the data.
- For **each** numbered requirement below, use **one** MongoDB operation (one `mongoimport` / `mongosh` statement or **one** aggregation pipeline where applicable). Do **not** split a requirement across multiple queries.
- For your **submission document**: paste the commands and include **screenshots of the results** you obtained.
- **Viva:** you must be able to **run and explain** each query.

**LO4:** MongoDB data loading, querying, and aggregation.

---

## Requirement → command (single statement each)

Replace `xxxxx` with your credentials. Run `mongoimport` from the folder that contains `books.json` (or use an absolute `--file` path).

### 1. Create database `iitdb`, collection `books`, load the dataset

`mongoimport` targets database `iitdb` and collection `books`; loading creates the database and collection if they do not exist.

```bash
mongoimport --uri "mongodb+srv://books.sdtk75h.mongodb.net/iitdb" \
  --username xxxxx \
  --password xxxxx \
  --collection books \
  --file books.json
```

Optional in `mongosh` after import (not required if import succeeded):

```javascript
use iitdb
```

```javascript
db.createCollection("books")
show collections
db.books.find().pretty()
db.books.countDocuments({})
```

---

### 2. List only the titles of all published books

```javascript
use iitdb
db.books.find({ status: "PUBLISH" }, { title: 1, _id: 0 })
```

---

### 3. Find books with 300 to 450 pages (inclusive)

```javascript
db.books.find({ pageCount: { $gte: 300, $lte: 450 } })
```

```javascript
db.books.find(
  { pageCount: { $gte: 300, $lte: 450 } },
  { title: 1, pageCount: 1, _id: 1 }
)
```

```javascript
db.books
  .find(
    { pageCount: { $gte: 300, $lte: 450 } },
    { title: 1, pageCount: 1, _id: 1 }
  )
  .sort({ _id: 1 })
```

### 4. Count books where the author is `Robi Sen`

```javascript
db.books.countDocuments({ authors: "Robi Sen" })
```

---

### 5. Titles starting with `Mongo`; show only title and authors

```javascript
db.books.find({ title: /^Mongo/ }, { title: 1, authors: 1, _id: 0 })
```

---

### 6. Category `Internet` via first `categories` element; first author + title; sort first author ascending, then title descending

Single query:

```javascript
db.books
  .find(
    { "categories.0": "Internet" },
    { authors: { $slice: 1 }, title: 1, _id: 0 }
  )
  .sort({ "authors.0": 1, title: -1 })
```

---

### 7. Books with more than four authors; title and number of authors only

```javascript
db.books.aggregate([
  { $match: { $expr: { $gt: [{ $size: "$authors" }, 4] } } },
  { $project: { _id: 0, title: 1, numberOfAuthors: { $size: "$authors" } } },
])
```

---

### 8. Published books: count per category; output must include the count for **Internet** (one pipeline)

This pipeline lists **every** category for published books; the row where `_id` is `"Internet"` is the Internet count (satisfies “each category” and “Internet” in one query).

```javascript
db.books.aggregate([
  { $match: { status: "PUBLISH" } },
  { $unwind: "$categories" },
  { $group: { _id: "$categories", count: { $sum: 1 } } },
  { $match: { _id: "Internet" } },
])
```

If your marker expects **only** the Internet line while still being “one query”, you can end the same pipeline with a match on `"Internet"` — note that the visible result is then no longer “all categories” in the shell output:

```javascript
db.books.aggregate([
  { $match: { status: "PUBLISH" } },
  { $unwind: "$categories" },
  { $group: { _id: "$categories", bookCount: { $sum: 1 } } },
  { $match: { _id: "Internet" } },
  { $project: { category: "$_id", bookCount: 1, _id: 0 } },
])
```

Use whichever reading your lecturer confirmed; the **first** pipeline matches the wording “for each category” most directly.

---

## Raw one-liners (`cmd.txt`)

Compact copies of the same ideas live in `cmd.txt` in this folder for quick paste.

---

*Also see repository root `README.md` and `books.json`.*
