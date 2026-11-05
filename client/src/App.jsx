import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import Login from "./components/Login.jsx";
import MicButton from "./components/MicButton.jsx";
import ChatLog from "./components/ChatLog.jsx";
import KhataTable from "./components/KhataTable.jsx";
import StockTable from "./components/StockTable.jsx";
export default function App() {
  const [user, setUser] = useState(null),
    [data, setData] = useState({
      parties: [],
      items: [],
      transactions: [],
      toBuy: [],
    }),
    [messages, setMessages] = useState([]),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const refresh = useCallback(async () => setData(await api.snapshot()), []);
  useEffect(() => {
    api
      .me()
      .then((x) => {
        setUser(x.user);
        return refresh();
      })
      .catch(() => {});
  }, [refresh]);
  async function login(username, password) {
    const x = await api.login({ username, password });
    setUser(x.user);
    await refresh();
  }
  function addMessage(result) {
    setMessages((m) => [
      ...m,
      {
        ...result,
        time: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    if (result.audioBase64) {
      const audio = new Audio(
        `data:${result.audioMime || "audio/mpeg"};base64,${result.audioBase64}`,
      );
      audio.play().catch(() => {});
    }
    refresh().catch(() => {});
  }
  async function sendText(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const r = await api.text(text.trim());
      addMessage(r);
      setText("");
    } catch (x) {
      setError(x.message);
    } finally {
      setBusy(false);
    }
  }
  async function sendAudio(blob) {
    setBusy(true);
    setError("");
    try {
      addMessage(await api.audio(blob));
    } catch (x) {
      setError(x.message);
    } finally {
      setBusy(false);
    }
  }
  async function undo() {
    setBusy(true);
    try {
      const r = await api.undo();
      addMessage({ reply: r.reply });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await api.logout();
    setUser(null);
    setMessages([]);
  }
  if (!user) return <Login onLogin={login} />;
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark small">म</span>
          <div>
            <b>Munshi</b>
            <small>Aapki dukaan ka smart munim</small>
          </div>
        </div>
        <button className="ghost" onClick={logout}>
          Logout
        </button>
      </header>
      <main className="dashboard">
        <section className="welcome">
          <div>
            <p className="eyebrow">NAMASTE, {user.username.toUpperCase()}</p>
            <h1>
              Dukaan ka hisaab,
              <br />
              <em>ab awaaz se.</em>
            </h1>
            <p className="muted">Udhaar, payment aur stock — bas boliye.</p>
          </div>
          <span className="welcome-icon">🧾</span>
        </section>
        <section className="voice-card">
          <MicButton onRecorded={sendAudio} busy={busy} />
          <form className="text-fallback" onSubmit={sendText}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ya yahan likhein… e.g. Sharma ji ko 250 rupay udhaar"
            />
            <button className="primary" disabled={busy || !text.trim()}>
              Bhejein
            </button>
          </form>
          {error && <p className="error">{error}</p>}
        </section>
        <ChatLog messages={messages} />
        <div className="tables-grid">
          <KhataTable parties={data.parties} />
          <StockTable items={data.items} />
        </div>
        <section className="panel buy-panel">
          <div>
            <h2>🛒 Mangwana hai</h2>
            <p className="muted">Items jo purchase karne hain</p>
          </div>
          <div className="buy-list">
            {data.toBuy.length ? (
              data.toBuy.map((i) => <span key={i._id}>{i.name}</span>)
            ) : (
              <small className="muted">List abhi khaali hai</small>
            )}
          </div>
        </section>
        <button className="undo-button" onClick={undo} disabled={busy}>
          ↶ Pichhli entry undo karein
        </button>
      </main>
      <footer>Munshi · Aapke dukaan ka digital khata</footer>
    </div>
  );
}
