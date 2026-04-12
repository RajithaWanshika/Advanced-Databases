import { db } from "./env.js";

const snapshot = await db
  .collection("tap_logs")
  .where("devicePlatform", "in", ["android", "pc"])
  .get();

const result = {
  android: { total: 0, count: 0 },
  pc: { total: 0, count: 0 },
};

snapshot.forEach((doc) => {
  const data = doc.data();
  const platform = data.devicePlatform;
  const duration = data.durationMs || 0;
  if (result[platform]) {
    result[platform].total += duration;
    result[platform].count += 1;
  }
});

const output = Object.keys(result).map((p) => ({
  devicePlatform: p,
  meanDurationMs: result[p].count ? result[p].total / result[p].count : 0,
  tapCount: result[p].count,
}));

console.log(output);
