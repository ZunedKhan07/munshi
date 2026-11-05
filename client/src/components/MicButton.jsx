import useRecorder from "../hooks/useRecorder.js";
export default function MicButton({ onRecorded, busy }) {
  const rec = useRecorder(onRecorded);
  async function toggle() {
    if (rec.state === "recording") return rec.stop();
    try {
      await rec.start();
    } catch (e) {
      alert(e.message);
    }
  }
  const label =
    busy || rec.state === "processing"
      ? "Sun raha hoon…"
      : rec.state === "recording"
        ? "Recording — rokne ke liye tap karein"
        : "Bolne ke liye tap karein";
  return (
    <section className="mic-area">
      <button
        className={`mic-button ${rec.state === "recording" ? "recording" : ""}`}
        onClick={toggle}
        disabled={busy || rec.state === "processing"}
        aria-label={label}
      >
        <span>{rec.state === "recording" ? "■" : "🎙️"}</span>
      </button>
      <strong>{label}</strong>
      <small>15 second tak bol sakte hain</small>
    </section>
  );
}
