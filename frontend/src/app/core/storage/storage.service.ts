import { Injectable } from '@angular/core';
import { StorageError } from './storage-error';

/**
 * The only code that touches localStorage. The app is browser-only (no SSR),
 * so no platform guards are needed (research R1).
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  read<T>(key: string, isValid: (value: unknown) => value is T): T | null {
    let raw: string | null;
    try {
      raw = localStorage.getItem(key);
    } catch (cause) {
      throw new StorageError('unreadable', { cause });
    }
    if (raw === null) {
      return null;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (cause) {
      throw new StorageError('unreadable', { cause });
    }
    if (!isValid(parsed)) {
      throw new StorageError('unreadable');
    }
    return parsed;
  }

  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (cause) {
      throw new StorageError('unavailable', { cause });
    }
  }
}
