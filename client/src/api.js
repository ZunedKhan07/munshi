async function call(url, options = {}) {
  const r = await fetch(url, {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error?.message || "Request failed");
  return data;
}
export const api = {
  me: () => call("/api/auth/me"),
  login: (body) =>
    call("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => call("/api/auth/logout", { method: "POST" }),
  text: (text) =>
    call("/api/voice/text", { method: "POST", body: JSON.stringify({ text }) }),
  audio: (blob) => {
    const fd = new FormData();
    fd.append("audio", blob, "recording.webm");
    return call("/api/voice", { method: "POST", body: fd });
  },
  snapshot: async () => {
    const [parties, items, transactions, toBuy] = await Promise.all(
      ["/api/parties", "/api/items", "/api/transactions", "/api/to-buy"].map(
        (x) => call(x),
      ),
    );
    return { parties, items, transactions, toBuy };
  },
  undo: () => call("/api/undo", { method: "POST" }),
};
