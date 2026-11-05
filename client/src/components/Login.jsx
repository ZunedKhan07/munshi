import { useState } from "react";
export default function Login({ onLogin }) {
  const [username, setU] = useState("munshi"),
    [password, setP] = useState(""),
    [error, setE] = useState(""),
    [busy, setB] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setB(true);
    setE("");
    try {
      await onLogin(username, password);
    } catch (x) {
      setE(x.message);
    } finally {
      setB(false);
    }
  }
  return (
    <main className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark">म</div>
        <p className="eyebrow">KIRANA SAATHI</p>
        <h1>Munshi</h1>
        <p className="muted">Aapki dukaan ka smart munim</p>
        <label>
          Username
          <input
            value={username}
            onChange={(e) => setU(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setP(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary full" disabled={busy}>
          {busy ? "Logging in…" : "Login karein"}
        </button>
        <small>Demo credentials server owner se lein.</small>
      </form>
    </main>
  );
}
