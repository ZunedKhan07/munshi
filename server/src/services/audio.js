import { normalizeAudio, stt } from "./gnani.js";

export async function transcribeUpload(file) {
  // 1. Check if file exists
  if (!file?.buffer) {
    console.error("❌ Audio Error: File buffer missing hai! Request mein audio nahi mila.");
    throw Object.assign(new Error("Audio file is required"), {
      status: 400,
      code: "AUDIO_REQUIRED",
    });
  }

  const allowed = [
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
  ];

  const mimeType = String(file.mimetype).split(";")[0];
  
  // 2. Check supported audio format
  if (!allowed.includes(mimeType)) {
    console.error(`❌ Audio Error: Unsupported audio type received -> ${mimeType}`);
    throw Object.assign(new Error("Unsupported audio type"), {
      status: 415,
      code: "AUDIO_TYPE",
    });
  }

  try {
    console.log(`🎙️ Processing audio: size = ${file.buffer.length} bytes, type = ${mimeType}`);
    const wav = await normalizeAudio(file.buffer, file.originalname);
    const result = await stt(wav);
    console.log("✅ Audio successfully transcribed!");
    return result;
  } catch (err) {
    console.error("🔥 STT / Normalization Internal Error:", err);
    throw err;
  }
}