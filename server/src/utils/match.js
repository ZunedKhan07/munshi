import Fuse from "fuse.js";
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export function findMatches(query, records) {
  if (!records?.length) return [];
  const fuse = new Fuse(records, {
    keys: ["name", "aliases"],
    includeScore: true,
    threshold: 0.42,
    ignoreLocation: true,
  });
  return fuse
    .search(String(query))
    .slice(0, 3)
    .map((x) => ({ ...x.item, score: x.score }));
}
export function chooseMatch(query, records) {
  const hits = findMatches(query, records);
  if (!hits.length || hits[0].score > 0.35)
    return { status: "none", matches: [] };
  if (hits[1] && Math.abs(hits[0].score - hits[1].score) < 0.07)
    return { status: "ambiguous", matches: hits.slice(0, 2) };
  return { status: "match", record: hits[0], matches: hits };
}
