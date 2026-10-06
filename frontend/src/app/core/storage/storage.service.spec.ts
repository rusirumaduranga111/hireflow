import { TestBed } from '@angular/core/testing';
import { StorageError } from './storage-error';
import { StorageService } from './storage.service';

interface Sample {
  name: string;
}

const isSample = (value: unknown): value is Sample =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>)['name'] === 'string';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('returns null for a missing key', () => {
    expect(service.read('missing', isSample)).toBeNull();
  });

  it('round-trips a value', () => {
    service.write('sample', { name: 'Ravi Shah' });
    expect(service.read('sample', isSample)).toEqual({ name: 'Ravi Shah' });
  });

  it('throws "unreadable" for invalid JSON', () => {
    localStorage.setItem('sample', '{oops');
    expect(() => service.read('sample', isSample)).toThrowError(
      expect.objectContaining({ reason: 'unreadable' }),
    );
  });

  it('throws "unreadable" when the shape check fails', () => {
    localStorage.setItem('sample', JSON.stringify({ title: 'not a sample' }));
    expect(() => service.read('sample', isSample)).toThrowError(StorageError);
    expect(() => service.read('sample', isSample)).toThrowError(
      expect.objectContaining({ reason: 'unreadable' }),
    );
  });

  it('throws "unavailable" when localStorage refuses the write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    expect(() => service.write('sample', { name: 'Ravi Shah' })).toThrowError(
      expect.objectContaining({ reason: 'unavailable' }),
    );
  });
});
