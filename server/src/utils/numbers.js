const DIGITS = {
  "०": "0",
  "१": "1",
  "२": "2",
  "३": "3",
  "४": "4",
  "५": "5",
  "६": "6",
  "७": "7",
  "८": "8",
  "९": "9",
};
const WORDS = {
  zero: 0,
  एक: 1,
  एकं: 1,
  एक: 1,
  एक: 1,
  एक: 1,
  एक: 1,
  एक: 1,
  एक: 1,
  एक: 1,
  ek: 1,
  एक: 1,
  do: 2,
  दो: 2,
  dो: 2,
  teen: 3,
  तीन: 3,
  char: 4,
  चार: 4,
  paanch: 5,
  पांच: 5,
  पाँच: 5,
  chhe: 6,
  छह: 6,
  saat: 7,
  सात: 7,
  aath: 8,
  आठ: 8,
  nau: 9,
  नौ: 9,
  das: 10,
  दस: 10,
  gyarah: 11,
  ग्यारह: 11,
  barah: 12,
  बारह: 12,
  terah: 13,
  तेरह: 13,
  chaudah: 14,
  चौदह: 14,
  pandrah: 15,
  पंद्रह: 15,
  bees: 20,
  बीस: 20,
  pachis: 25,
  पच्चीस: 25,
  tees: 30,
  तीस: 30,
  chaalis: 40,
  चालीस: 40,
  pachas: 50,
  पचास: 50,
  sau: 100,
  सौ: 100,
  hazar: 1000,
  hajaar: 1000,
  hazaar: 1000,
  हजार: 1000,
  हज़ार: 1000,
  lakh: 100000,
  लाख: 100000,
  dedh: 1.5,
  डेढ़: 1.5,
  dhai: 2.5,
  ढाई: 2.5,
  sawa: 1.25,
  सवा: 1.25,
};
export function normalizeDigits(s) {
  return String(s).replace(/[०-९]/g, (c) => DIGITS[c]);
}
export function parseHinglishNumber(input) {
  const raw = normalizeDigits(
    String(input || "")
      .toLowerCase()
      .trim(),
  );
  if (!raw) return null;
  const n = Number(raw.replace(/,/g, ""));
  if (Number.isFinite(n)) return n;
  const tokens = raw.replace(/-/g, " ").split(/\s+/);
  let total = 0,
    group = 0,
    found = false;
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (t === "paune" && i + 1 < tokens.length) {
      const next = WORDS[tokens[++i]];
      if (next != null) {
        group += next - 0.25;
        found = true;
      }
      continue;
    }
    if (t === "sau" && tokens[i + 1] === "pachas") {
      group += 150;
      i++;
      found = true;
      continue;
    }
    const v = WORDS[t];
    if (v == null) continue;
    found = true;
    if (v === 100000 || v === 1000) {
      total += (group || 1) * v;
      group = 0;
    } else if (v === 100) {
      group = (group || 1) * 100;
    } else group += v;
  }
  return found ? total + group : null;
}
export function normalizeUnit(unit = "piece") {
  const u = String(unit).toLowerCase();
  if (["kilo", "kg", "kgs", "किलो"].includes(u)) return "kg";
  if (["gram", "grams", "g", "ग्राम"].includes(u)) return "gram";
  if (["litre", "liter", "l", "लीटर"].includes(u)) return "litre";
  if (["packet", "packets", "पैकेट"].includes(u)) return "packet";
  if (["dozen", "darjan", "दर्जन"].includes(u)) return "dozen";
  return "piece";
}
