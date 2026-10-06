export type StorageErrorReason = 'unreadable' | 'unavailable';

/** Any failure reading or writing browser storage. */
export class StorageError extends Error {
  constructor(
    readonly reason: StorageErrorReason,
    options?: { cause?: unknown },
  ) {
    super(`Storage ${reason}`, options);
    this.name = 'StorageError';
  }
}
