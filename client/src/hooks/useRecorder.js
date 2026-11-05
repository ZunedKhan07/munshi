import { useRef, useState } from "react";
export default function useRecorder(onRecorded) {
  const recorder = useRef(null),
    chunks = useRef([]),
    timer = useRef(null);
  const [state, setState] = useState("idle");
  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
      const mime = types.find((t) => window.MediaRecorder?.isTypeSupported(t));
      const mr = new MediaRecorder(
        stream,
        mime ? { mimeType: mime } : undefined,
      );
      recorder.current = mr;
      chunks.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        clearTimeout(timer.current);
        const blob = new Blob(chunks.current, {
          type: mr.mimeType || "audio/webm",
        });
        setState("processing");
        onRecorded(blob).finally(() => setState("idle"));
      };
      mr.start();
      setState("recording");
      timer.current = setTimeout(() => stop(), 15000);
    } catch {
      setState("idle");
      throw new Error(
        "Microphone permission nahi mili. Browser settings mein mic allow karein.",
      );
    }
  }
  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }
  return { state, start, stop };
}
