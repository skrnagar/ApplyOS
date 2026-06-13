/**
 * Server-side resume text extraction for ATS content analysis.
 */

import { createRequire } from "module";

const require = createRequire(import.meta.url);

async function loadPdfJs() {
  return require("pdfjs-dist/legacy/build/pdf.js");
}

function toUint8Array(buffer) {
  if (Buffer.isBuffer(buffer)) {
    return new Uint8Array(buffer);
  }
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}

export async function extractResumeText(buffer, fileName = "") {
  const name = (fileName || "").toLowerCase();
  if (name.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }
  if (name.endsWith(".docx")) {
    return extractDocxText(buffer);
  }
  if (name.endsWith(".doc")) {
    return { text: "", method: "doc", error: "legacy_doc" };
  }
  return { text: "", method: "unknown" };
}

async function extractPdfText(buffer) {
  try {
    const pdfjs = await loadPdfJs();
    const data = toUint8Array(buffer);
    const doc = await pdfjs.getDocument({
      data,
      useSystemFonts: true,
      isEvalSupported: false,
      useWorkerFetch: false,
      disableWorker: true,
    }).promise;

    const parts = [];
    for (let page = 1; page <= doc.numPages; page++) {
      const pdfPage = await doc.getPage(page);
      const content = await pdfPage.getTextContent();
      const pageText = content.items
        .map((item) => (typeof item.str === "string" ? item.str : ""))
        .join(" ");
      parts.push(pageText);
    }

    const text = parts.join("\n").replace(/\s+/g, " ").trim();
    return {
      text,
      method: "pdf",
      pageCount: doc.numPages,
      charCount: text.length,
      extracted: text.length > 40,
    };
  } catch (err) {
    console.error("extractPdfText:", err?.message || err);
    return { text: "", method: "pdf", extracted: false, error: "pdf_parse_failed" };
  }
}

async function extractDocxText(buffer) {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || "").replace(/\s+/g, " ").trim();
    return {
      text,
      method: "docx",
      charCount: text.length,
      extracted: text.length > 40,
    };
  } catch (err) {
    console.error("extractDocxText:", err?.message || err);
    return { text: "", method: "docx", extracted: false, error: "docx_parse_failed" };
  }
}
