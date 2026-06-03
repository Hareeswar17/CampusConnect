import { randomUUID } from "node:crypto";
import { ENV } from "./env.js";

export const AZURE_READY =
  Boolean(ENV.AZURE_TRANSLATOR_KEY) &&
  Boolean(ENV.AZURE_TRANSLATOR_ENDPOINT) &&
  Boolean(ENV.AZURE_TRANSLATOR_REGION) &&
  Boolean(ENV.AZURE_SPEECH_KEY) &&
  Boolean(ENV.AZURE_SPEECH_REGION);

const TTS_PROFILE_BY_LANGUAGE = {
  en: { voiceName: "en-GB-SoniaNeural", locale: "en-GB" },
  es: { voiceName: "es-ES-ElviraNeural", locale: "es-ES" },
  fr: { voiceName: "fr-FR-DeniseNeural", locale: "fr-FR" },
  de: { voiceName: "de-DE-KatjaNeural", locale: "de-DE" },
  hi: { voiceName: "hi-IN-SwaraNeural", locale: "hi-IN" },
  mr: { voiceName: "mr-IN-AarohiNeural", locale: "mr-IN" },
};

const DEFAULT_TTS_PROFILE = {
  voiceName: "en-US-AvaMultilingualNeural",
  locale: "en-US",
};

const getTtsProfile = (targetLanguage) =>
  TTS_PROFILE_BY_LANGUAGE[targetLanguage] || DEFAULT_TTS_PROFILE;

const normalizeTranslatorEndpoint = (endpoint) => endpoint.replace(/\/+$/, "");

export const translateWithAzure = async ({ text, targetLanguage }) => {
  const endpoint = normalizeTranslatorEndpoint(ENV.AZURE_TRANSLATOR_ENDPOINT);
  const url = `${endpoint}/translate?api-version=3.0&to=${encodeURIComponent(targetLanguage)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": ENV.AZURE_TRANSLATOR_KEY,
      "Ocp-Apim-Subscription-Region": ENV.AZURE_TRANSLATOR_REGION,
      "Content-Type": "application/json",
      "X-ClientTraceId": randomUUID(),
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure translator failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  return data?.[0]?.translations?.[0]?.text || "";
};

export const synthesizeSpeechWithAzure = async ({ text, targetLanguage }) => {
  const profile = getTtsProfile(targetLanguage);
  const ttsEndpoint = `https://${ENV.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
  const escapedText = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const ssml = `<speak version='1.0' xml:lang='${profile.locale}'><voice xml:lang='${profile.locale}' name='${profile.voiceName}'>${escapedText}</voice></speak>`;

  const response = await fetch(ttsEndpoint, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": ENV.AZURE_SPEECH_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
      "User-Agent": "CampusConnect",
    },
    body: ssml,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Azure speech failed: ${response.status} ${errorBody}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  return `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;
};

export const runTranslationJob = async ({ text, targetLanguage, mode = "text" }) => {
  if (!AZURE_READY) {
    throw new Error("Azure translation service is not configured.");
  }

  const cleanText = (text || "").toString().trim();
  const cleanTargetLanguage = (targetLanguage || "").toString().trim().toLowerCase();

  if (!cleanText) {
    throw new Error("Text is required for translation.");
  }

  if (!cleanTargetLanguage) {
    throw new Error("Target language is required.");
  }

  const translatedText = await translateWithAzure({ text: cleanText, targetLanguage: cleanTargetLanguage });

  if (mode !== "voice") {
    return {
      translatedText,
      targetLanguage: cleanTargetLanguage,
      provider: "azure",
    };
  }

  const translatedAudio = await synthesizeSpeechWithAzure({
    text: translatedText,
    targetLanguage: cleanTargetLanguage,
  });

  return {
    translatedText,
    translatedAudio,
    targetLanguage: cleanTargetLanguage,
    provider: "azure",
  };
};
