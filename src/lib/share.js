// ============================================================
// URL COMPARTIBLE: comprime el proyecto con pako y lo codifica
// en base64 URL-safe dentro de ?project=...
// ============================================================

import { deflate, inflate } from "pako";
import { projectToJson } from "./export.js";

function toB64(uint8) {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < uint8.length; i += chunk) {
    bin += String.fromCharCode.apply(null, uint8.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function urlSafe(b64) {
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromUrlSafe(s) {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return b64;
}

// Genera el parámetro ?project= para el proyecto actual.
export function buildShareParam(project, fps) {
  const json = projectToJson(project, fps);
  return urlSafe(toB64(deflate(json)));
}

// Descomprime el parámetro y devuelve el JSON (string).
export function readShareParam(param) {
  const binary = atob(fromUrlSafe(param));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(inflate(bytes));
}