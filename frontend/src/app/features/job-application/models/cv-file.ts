/** Metadata of the chosen CV. The file's contents are never read or stored. */
export interface CvFile {
  readonly fileName: string;
  readonly sizeBytes: number;
}
