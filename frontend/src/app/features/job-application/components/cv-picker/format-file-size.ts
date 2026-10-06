const KB = 1024;
const MB = 1024 * 1024;

/** Formats a file size the way the design does: whole KB, or MB to one decimal place. */
export function formatFileSize(sizeBytes: number): string {
  return sizeBytes > MB
    ? `${(sizeBytes / MB).toFixed(1)} MB`
    : `${Math.max(1, Math.round(sizeBytes / KB))} KB`;
}
