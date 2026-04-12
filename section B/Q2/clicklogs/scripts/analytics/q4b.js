import { db } from "./env.js";

const snapshot = await db
  .collection("tap_logs")
  .where("interfaceType", "in", ["feedbackshown", "nofeedback"])
  .get();

const result = {
  feedbackshown: { total: 0, count: 0 },
  nofeedback: { total: 0, count: 0 },
};

snapshot.forEach((doc) => {
  const data = doc.data();
  const type = data.interfaceType;
  const duration = data.durationMs || 0;
  if (result[type]) {
    result[type].total += duration;
    result[type].count += 1;
  }
});

const output = Object.keys(result).map((t) => ({
  interfaceType: t,
  meanDurationMs: result[t].count ? result[t].total / result[t].count : 0,
  tapCount: result[t].count,
}));

console.log(output);
