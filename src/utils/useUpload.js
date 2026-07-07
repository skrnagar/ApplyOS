import * as React from "react";
import { getApiAuthHeaders } from "@/utils/apiAuthHeaders";

function useUpload() {
  const [loading, setLoading] = React.useState(false);
  const upload = React.useCallback(async (input) => {
    try {
      setLoading(true);
      if (!("file" in input && input.file)) {
        return { error: "Only file uploads are supported." };
      }

      const formData = new FormData();
      formData.append("file", input.file);
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: await getApiAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 413) {
          throw new Error("Upload failed: File too large.");
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      return { url: data.url, mimeType: data.mimeType || null };
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        return { error: uploadError.message };
      }
      if (typeof uploadError === "string") {
        return { error: uploadError };
      }
      return { error: "Upload failed" };
    } finally {
      setLoading(false);
    }
  }, []);

  return [upload, { loading }];
}

export { useUpload };
export default useUpload;
