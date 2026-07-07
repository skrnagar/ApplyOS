import { extractResumeText } from "./extractResumeText.js";
import { scoreResumeAts } from "@/utils/atsScore";

/**
 * Full ATS pipeline: extract text → score content + file metadata.
 */
export async function analyzeResumeFile(buffer, { fileName, fileSize, mimeType, email }) {
  const extraction = await extractResumeText(buffer, fileName);
  const result = scoreResumeAts({
    fileName,
    fileSize,
    mimeType,
    email,
    text: extraction.text,
    textExtracted: extraction.extracted === true,
  });

  return {
    ...result,
    extraction: {
      method: extraction.method,
      char_count: extraction.charCount ?? extraction.text?.length ?? 0,
      page_count: extraction.pageCount ?? null,
      extracted: extraction.extracted !== false && Boolean(extraction.text?.trim()),
    },
  };
}
