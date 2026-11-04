"use strict";

const mediaConfig = window.MEDIA_UPLOAD_CONFIG || {};
const eventKey = mediaConfig.eventSlug || "evento";
const nameStorageKey = `eventos-de-axe:${eventKey}:media-name`;
const visitorStorageKey = `eventos-de-axe:${eventKey}:media-visitor`;
const form = document.getElementById("uploadForm");
const nameInput = document.getElementById("fullName");
const fileInput = document.getElementById("mediaFiles");
const fileList = document.getElementById("fileList");
const emptyFiles = document.getElementById("emptyFiles");
const submit = document.getElementById("submitUpload");
const nameError = document.getElementById("nameError");
const savedIdentity = document.getElementById("savedIdentity");
const savedIdentityName = document.getElementById("savedIdentityName");
const identityFields = document.getElementById("identityFields");
const serviceStatus = document.getElementById("serviceStatus");
const turnstileContainer = document.getElementById("turnstileContainer");

let files = [];
let knownName = safeRead(nameStorageKey);
let visitorKey = safeRead(visitorStorageKey) || createVisitorKey();
let turnstileToken = "";
let turnstileWidgetId = null;
let uploading = false;

function safeRead(key) { try { return normalizeName(localStorage.getItem(key)); } catch { return ""; } }
function safeWrite(key, value) { try { localStorage.setItem(key, value); } catch {} }
function normalizeName(value) { return String(value || "").trim().replace(/\s+/g, " "); }
function createVisitorKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const key = Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
  safeWrite(visitorStorageKey, key);
  return key;
}
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes || 0} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let index = -1;
  do { bytes /= 1024; index += 1; } while (bytes >= 1024 && index < units.length - 1);
  return `${bytes.toFixed(bytes >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
function isReceivingOpen() { return mediaConfig.receivesUntil && new Date(mediaConfig.receivesUntil) > new Date(); }
function isConfigured() { return Boolean(mediaConfig.apiUrl && mediaConfig.turnstileSiteKey); }
function setStatus(message) { serviceStatus.textContent = message; }
function renderIdentity() {
  const hasIdentity = Boolean(knownName);
  savedIdentity.hidden = !hasIdentity;
  identityFields.hidden = hasIdentity;
  if (hasIdentity) savedIdentityName.textContent = knownName;
}
function updateSubmitState() {
  submit.disabled = uploading || !files.length || !isReceivingOpen() || !isConfigured();
  if (!isReceivingOpen()) setStatus("O período de recebimento foi encerrado.");
  else if (!mediaConfig.apiUrl) setStatus("A área está sendo preparada. O envio será liberado quando a organização concluir a configuração.");
  else if (!mediaConfig.turnstileSiteKey) setStatus("A proteção do envio ainda está sendo configurada.");
  else if (!uploading) setStatus("Os arquivos vão direto para uma pasta privada da organização.");
}
function renderFiles() {
  fileList.replaceChildren();
  files.forEach((file, index) => {
    const item = document.createElement("li");
    item.innerHTML = '<div><strong></strong><span></span></div><button type="button" aria-label="Remover arquivo">Remover</button>';
    item.querySelector("strong").textContent = file.name;
    item.querySelector("span").textContent = `${file.type || "Tipo não informado"} · ${formatBytes(file.size)}`;
    item.querySelector("button").addEventListener("click", () => { files.splice(index, 1); renderFiles(); });
    fileList.append(item);
  });
  emptyFiles.hidden = files.length > 0;
  updateSubmitState();
}
function showNameError(message) { nameError.textContent = message; nameError.hidden = !message; }
function renderTurnstile() {
  if (!mediaConfig.turnstileSiteKey || !window.turnstile || turnstileWidgetId !== null) return;
  turnstileWidgetId = window.turnstile.render(turnstileContainer, {
    sitekey: mediaConfig.turnstileSiteKey,
    theme: "light",
    callback: token => { turnstileToken = token; updateSubmitState(); },
    "expired-callback": () => { turnstileToken = ""; },
    "error-callback": () => { turnstileToken = ""; setStatus("A verificação de segurança não pôde ser carregada. Atualize a página e tente novamente."); },
  });
}
function waitForTurnstile() {
  if (!mediaConfig.turnstileSiteKey) return;
  renderTurnstile();
  if (turnstileWidgetId === null) window.setTimeout(waitForTurnstile, 150);
}
async function api(path, body) {
  const response = await fetch(`${mediaConfig.apiUrl}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Não foi possível preparar o envio.");
  return data;
}
async function uploadInChunks(sessionUrl, file, fileIndex, totalFiles) {
  const chunkSize = 8 * 1024 * 1024;
  let start = 0;
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const currentChunk = file.slice(start, end);
    setStatus(`Enviando ${fileIndex + 1} de ${totalFiles}: ${file.name} (${Math.round((end / file.size) * 100)}%)`);
    let response;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        response = await fetch(sessionUrl, { method: "PUT", headers: { "Content-Range": `bytes ${start}-${end - 1}/${file.size}` }, body: currentChunk });
        if (response.status === 308 || response.ok) break;
      } catch {
        if (attempt === 2) throw new Error(`A conexão caiu durante o envio de ${file.name}. Tente novamente; arquivos já concluídos permanecem guardados.`);
      }
      await new Promise(resolve => window.setTimeout(resolve, 1000 * (attempt + 1)));
    }
    if (!response || (response.status !== 308 && !response.ok)) throw new Error(`Não foi possível enviar ${file.name}. Tente novamente.`);
    if (response.ok) return response.json();
    start = end;
  }
  throw new Error(`O envio de ${file.name} não foi concluído.`);
}
async function resetTurnstile() {
  turnstileToken = "";
  if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  for (let attempts = 0; attempts < 100 && !turnstileToken; attempts += 1) await new Promise(resolve => window.setTimeout(resolve, 100));
  if (!turnstileToken) throw new Error("A verificação de segurança expirou. Atualize a página e tente novamente.");
}
async function startUploads(fullName) {
  uploading = true;
  let completed = false;
  updateSubmitState();
  try {
    for (let index = 0; index < files.length; index += 1) {
      if (!turnstileToken) await resetTurnstile();
      const file = files[index];
      setStatus(`Preparando ${index + 1} de ${files.length}: ${file.name}`);
      const session = await api("/api/uploads/init", { fullName, visitorKey, turnstileToken, file: { name: file.name, type: file.type, size: file.size } });
      await resetTurnstile();
      const driveFile = await uploadInChunks(session.sessionUrl, file, index, files.length);
      await api("/api/uploads/complete", { visitorKey, uploadId: session.uploadId, driveFileId: driveFile.id });
    }
    files = [];
    renderFiles();
    completed = true;
  } catch (error) { setStatus(error.message || "Não foi possível concluir o envio. Tente novamente."); }
  finally {
    uploading = false;
    updateSubmitState();
    if (completed) setStatus("Envio concluído. Obrigado por compartilhar este momento.");
  }
}

fileInput.addEventListener("change", () => { files = [...files, ...Array.from(fileInput.files || [])]; fileInput.value = ""; renderFiles(); });
document.getElementById("changeIdentity").addEventListener("click", () => { knownName = ""; nameInput.value = ""; renderIdentity(); nameInput.focus(); });
form.addEventListener("submit", async event => {
  event.preventDefault();
  const name = knownName || normalizeName(nameInput.value);
  if (!name || name.split(" ").length < 2) { showNameError("Informe seu nome e sobrenome para continuar."); nameInput.focus(); return; }
  if (!turnstileToken) { showNameError("Aguarde a verificação de segurança e tente novamente."); return; }
  showNameError(""); knownName = name; safeWrite(nameStorageKey, name); renderIdentity(); await startUploads(name);
});

renderIdentity();
renderFiles();
waitForTurnstile();
