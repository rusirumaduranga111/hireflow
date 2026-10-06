import { TestBed } from '@angular/core/testing';
import { SENIOR_DOTNET_ENGINEER } from '../data/senior-dotnet-engineer';
import { ApplicationDraft } from '../models/application-draft';
import { JobApplication } from '../models/job-application';
import { StorageError } from '../../../core/storage/storage-error';
import { SAVE_FAILURE_SIMULATION, SUBMIT_LATENCY_MS } from './application.tokens';
import { ApplicationService } from './application.service';

const KEY = 'applications';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const draft: ApplicationDraft = {
  fullName: '  Ravi Shah ',
  email: ' ravi.shah@fastmail.co.uk ',
  linkedInUrl: ' https://www.linkedin.com/in/ravi-shah-dotnet ',
  cv: { fileName: 'Ravi-Shah-CV-2026.pdf', sizeBytes: 248312 },
  coverNote:
    "  I've spent six years on .NET services in clinical scheduling, most recently leading our booking engine migration.  ",
};

const earlier: JobApplication = {
  id: '0b6c1f3e-8d2a-4f5b-9c7e-1a2b3c4d5e6f',
  roleId: 'senior-dotnet-engineer',
  jobTitle: 'Senior .NET Engineer (Remote, UK)',
  company: 'Northgate Labs',
  fullName: 'Maya Okafor',
  email: 'maya.okafor@proton.me',
  linkedInUrl: null,
  cv: { fileName: 'Maya-Okafor-CV.docx', sizeBytes: 91234 },
  coverNote:
    'Platform engineer with five years of C# and Service Bus work in regulated payments systems.',
  submittedAt: '2026-09-30T14:05:00.000Z',
};

function stored(): JobApplication[] {
  return JSON.parse(localStorage.getItem(KEY) ?? '[]') as JobApplication[];
}

function createService(): ApplicationService {
  TestBed.configureTestingModule({ providers: [{ provide: SUBMIT_LATENCY_MS, useValue: 0 }] });
  return TestBed.inject(ApplicationService);
}

describe('ApplicationService', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    vi.restoreAllMocks();
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  describe('submit', () => {
    it('appends to the existing array and keeps earlier records', async () => {
      localStorage.setItem(KEY, JSON.stringify([earlier]));
      const service = createService();

      await service.submit(SENIOR_DOTNET_ENGINEER, draft);

      const all = stored();
      expect(all).toHaveLength(2);
      expect(all[0]).toEqual(earlier);
      expect(all[1].fullName).toBe('Ravi Shah');
    });

    it('trims every field and copies the role details', async () => {
      const service = createService();

      const record = await service.submit(SENIOR_DOTNET_ENGINEER, draft);

      expect(record).toMatchObject({
        roleId: 'senior-dotnet-engineer',
        jobTitle: 'Senior .NET Engineer (Remote, UK)',
        company: 'Northgate Labs',
        fullName: 'Ravi Shah',
        email: 'ravi.shah@fastmail.co.uk',
        linkedInUrl: 'https://www.linkedin.com/in/ravi-shah-dotnet',
        cv: { fileName: 'Ravi-Shah-CV-2026.pdf', sizeBytes: 248312 },
        coverNote: draft.coverNote.trim(),
      });
      expect(stored()).toEqual([record]);
    });

    it('stores null for an empty or whitespace-only LinkedIn URL', async () => {
      const service = createService();

      const record = await service.submit(SENIOR_DOTNET_ENGINEER, { ...draft, linkedInUrl: '   ' });

      expect(record.linkedInUrl).toBeNull();
    });

    it('sets a UUID id and an ISO 8601 submittedAt', async () => {
      const service = createService();

      const record = await service.submit(SENIOR_DOTNET_ENGINEER, draft);

      expect(record.id).toMatch(UUID);
      expect(new Date(record.submittedAt).toISOString()).toBe(record.submittedAt);
    });

    it('updates latest() to the new record', async () => {
      const service = createService();

      const record = await service.submit(SENIOR_DOTNET_ENGINEER, draft);

      expect(service.latest()).toEqual(record);
    });
  });

  describe('latest on start-up', () => {
    it('loads the last saved application from storage', () => {
      const second = {
        ...earlier,
        id: '7d3e9a10-2b4c-4d6e-8f01-23456789abcd',
        fullName: 'Ravi Shah',
      };
      localStorage.setItem(KEY, JSON.stringify([earlier, second]));

      expect(createService().latest()).toEqual(second);
    });

    it('is null, without throwing, when stored data is unreadable', () => {
      localStorage.setItem(KEY, '{oops');

      expect(createService().latest()).toBeNull();
    });

    it('keeps both records, in order, across a "Start again" and a second send', async () => {
      const service = createService();
      const first = await service.submit(SENIOR_DOTNET_ENGINEER, draft);
      const second = await service.submit(SENIOR_DOTNET_ENGINEER, {
        ...draft,
        fullName: 'Maya Okafor',
        email: 'maya.okafor@proton.me',
      });

      expect(stored().map((a) => a.id)).toEqual([first.id, second.id]);
      TestBed.resetTestingModule();
      expect(createService().latest()?.id).toBe(second.id);
    });
  });

  describe('submit failures', () => {
    it('rejects with "unavailable" when the write fails, and leaves latest() unchanged', async () => {
      const service = createService();
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

      await expect(service.submit(SENIOR_DOTNET_ENGINEER, draft)).rejects.toMatchObject({
        reason: 'unavailable',
      });
      expect(service.latest()).toBeNull();
    });

    it('fails once when the simulation is armed, without writing, then succeeds', async () => {
      const service = createService();
      TestBed.inject(SAVE_FAILURE_SIMULATION).arm();

      await expect(service.submit(SENIOR_DOTNET_ENGINEER, draft)).rejects.toBeInstanceOf(
        StorageError,
      );
      expect(localStorage.getItem(KEY)).toBeNull();

      await service.submit(SENIOR_DOTNET_ENGINEER, draft);
      expect(stored()).toHaveLength(1);
    });

    it('rejects with "unreadable" and never overwrites corrupt stored data', async () => {
      localStorage.setItem(KEY, '{oops');
      const service = createService();

      await expect(service.submit(SENIOR_DOTNET_ENGINEER, draft)).rejects.toMatchObject({
        reason: 'unreadable',
      });
      expect(localStorage.getItem(KEY)).toBe('{oops');
    });
  });
});
