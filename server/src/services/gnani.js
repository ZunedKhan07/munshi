import FormData from "form-data";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);
// VERIFY: Gnani TTS response envelope, accepted voice/model fields, output codec and STT accepted codecs can vary by account/API release.
const VERIFY = {
  base: "https://api.vachana.ai",
  sttPath: "/stt/v3",
  ttsPath: "/api/v1/tts/sse",
  timeoutMs: 20000,
  retries: 1,
};
class ProviderError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
async function requestRetry(url, options) {
  let last;
  for (let attempt = 0; attempt <= VERIFY.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), VERIFY.timeoutMs);
      try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        if (!res.ok) {
          const status = res.status;
          throw new ProviderError(
            status === 401
              ? "PROVIDER_AUTH"
              : status === 429
                ? "PROVIDER_RATE_LIMIT"
                : status >= 500
                  ? "PROVIDER_UNAVAILABLE"
                  : "PROVIDER_ERROR",
            `Gnani request failed (${status})`,
            status,
          );
        }
        return res;
      } finally {
        clearTimeout(timer);
      }
    } catch (e) {
      last = e;
      if (e instanceof ProviderError && e.status === 401) break;
      if (attempt < VERIFY.retries)
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw last || new ProviderError("PROVIDER_ERROR", "Gnani request failed");
}
export async function normalizeAudio(buffer, originalName = "recording.webm") {
  const ext = path.extname(originalName) || ".webm";
  const input = path.join(os.tmpdir(), `munshi-${randomUUID()}${ext}`),
    output = path.join(os.tmpdir(), `munshi-${randomUUID()}.wav`);
  try {
    await fs.writeFile(input, buffer);
    const probe = await new Promise((resolve, reject) =>
      ffmpeg.ffprobe(input, (err, data) => (err ? reject(err) : resolve(data))),
    );
    const duration = Number(probe.format?.duration || 0);
    if (!duration || duration > Number(process.env.VOICE_MAX_SECONDS || 20))
      throw new ProviderError(
        "AUDIO_DURATION",
        "Audio must be between 1 and 20 seconds",
      );
    await new Promise((resolve, reject) =>
      ffmpeg(input)
        .noVideo()
        .audioChannels(1)
        .audioFrequency(16000)
        .audioCodec("pcm_s16le")
        .format("wav")
        .on("end", resolve)
        .on("error", reject)
        .save(output),
    );
    const stat = await fs.stat(output);
    if (stat.size > 12 * 1024 * 1024)
      throw new ProviderError("AUDIO_TOO_LARGE", "Audio is too large");
    return await fs.readFile(output);
  } finally {
    await Promise.all([
      fs.unlink(input).catch(() => {}),
      fs.unlink(output).catch(() => {}),
    ]);
  }
}
export async function stt(wav) {
  const form = new FormData();
  form.append("audio_file", wav, {
    filename: "audio.wav",
    contentType: "audio/wav",
  });
  form.append("language_code", process.env.GNANI_STT_LANG || "hi-IN");
  const headers = {
    ...form.getHeaders(),
    "X-API-Key-ID": process.env.GNANI_API_KEY,
  };
  const res = await requestRetry(VERIFY.base + VERIFY.sttPath, {
    method: "POST",
    headers,
    body: form,
    duplex: "half",
  });
  const data = await res.json();
  if (!data.success || typeof data.transcript !== "string")
    throw new ProviderError(
      "STT_FAILED",
      "Speech recognition did not return text",
    );
  return data.transcript;
}
function detectMime(buf) {
  if (buf.subarray(0, 4).toString() === "RIFF") return "audio/wav";
  if (
    buf.subarray(0, 3).toString() === "ID3" ||
    (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)
  )
    return "audio/mpeg";
  if (buf.subarray(4, 8).toString() === "ftyp") return "audio/mp4";
  return "application/octet-stream";
}
export async function tts(text) {
  try {
    const res = await requestRetry(VERIFY.base + VERIFY.ttsPath, {
      method: "POST",
      headers: {
        "X-API-Key-ID": process.env.GNANI_API_KEY,
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json, audio/*",
      },
      body: JSON.stringify({
        text,
        voice: process.env.GNANI_TTS_VOICE || "Pranav",
        model: process.env.GNANI_TTS_MODEL || "timbre-v2.5",
      }),
    });
    const type = res.headers.get("content-type") || "";
    if (type.startsWith("audio/")) {
      const buffer = Buffer.from(await res.arrayBuffer());
      return {
        buffer,
        mime:
          detectMime(buffer) === "application/octet-stream"
            ? type
            : detectMime(buffer),
      };
    }
    const body = await res.text();
    let encoded = "";
    try {
      const j = JSON.parse(body);
      encoded = j.audioBase64 || j.audio || j.data || j.audio_content || "";
      if (typeof encoded === "object") encoded = encoded.data || "";
    } catch {}
    if (!encoded) {
      for (const line of body.split(/\r?\n/)) {
        if (line.startsWith("data:")) {
          const d = line.slice(5).trim();
          try {
            const j = JSON.parse(d);
            encoded += j.audio || j.audioBase64 || j.data || "";
          } catch {
            if (d && !["[DONE]"].includes(d)) encoded += d;
          }
        }
      }
    }
    if (!encoded)
      return { buffer: null, mime: null, errorCode: "TTS_EMPTY_RESPONSE" };
    const buffer = Buffer.from(encoded, "base64");
    return buffer.length
      ? {
          buffer,
          mime:
            detectMime(buffer) === "application/octet-stream"
              ? type.startsWith("audio/")
                ? type
                : "audio/mpeg"
              : detectMime(buffer),
        }
      : { buffer: null, mime: null, errorCode: "TTS_EMPTY_RESPONSE" };
  } catch (e) {
    return { buffer: null, mime: null, errorCode: e.code || "TTS_FAILED" };
  }
}
export { ProviderError };
