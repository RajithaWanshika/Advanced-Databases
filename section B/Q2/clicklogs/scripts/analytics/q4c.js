import { db } from "./env.js";

const snapshot = await db
  .collectionGroup("tap_logs")
  .orderBy("sessionId")
  .orderBy("interfaceSequence")
  .get();

const sessions = new Map();

snapshot.forEach((doc) => {
  const data = doc.data();
  const sessionId = data.sessionId;
  const seq = data.interfaceSequence || 0;

  if (!sessionId) return;

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, seq);
  } else {
    sessions.set(sessionId, Math.max(sessions.get(sessionId), seq));
  }
});

let completedBoth = 0;
let droppedAfterFirst = 0;

sessions.forEach((maxSeq) => {
  if (maxSeq >= 2) {
    completedBoth++;
  } else {
    droppedAfterFirst++;
  }
});

const result = {
  completedBoth,
  droppedAfterFirst,
  totalSessions: sessions.size,
};

console.log(result);
