import { ApplicationDraft } from '../models/application-draft';
import { errorSummary, validateApplication, validateCvFile } from './application-validation';

const TEN_MB = 10 * 1024 * 1024;
const NOTE_50 = 'I build and run .NET services for clinical teams..';

const valid: ApplicationDraft = {
  fullName: 'Ravi Shah',
  email: 'ravi.shah@fastmail.co.uk',
  linkedInUrl: '',
  cv: { fileName: 'Ravi-Shah-CV-2026.pdf', sizeBytes: 248312 },
  coverNote: NOTE_50,
};

const errorsFor = (patch: Partial<ApplicationDraft>) => validateApplication({ ...valid, ...patch });

describe('validateApplication', () => {
  it('has no errors for a complete, valid draft', () => {
    expect(NOTE_50).toHaveLength(50);
    expect(validateApplication(valid)).toEqual({});
  });

  it('reports every required field on an empty draft, but not LinkedIn', () => {
    expect(
      validateApplication({ fullName: '', email: '', linkedInUrl: '', cv: null, coverNote: '' }),
    ).toEqual({
      fullName: 'Enter your name.',
      email: 'Enter your email address.',
      cv: 'Attach your CV to apply.',
      coverNote: 'Add a short cover note.',
    });
  });

  describe('full name', () => {
    it.each(['', '   '])('requires a name (%j)', (fullName) => {
      expect(errorsFor({ fullName }).fullName).toBe('Enter your name.');
    });
  });

  describe('email', () => {
    it.each(['', '  '])('requires an email (%j)', (email) => {
      expect(errorsFor({ email }).email).toBe('Enter your email address.');
    });

    it.each(['ravi@northgate', 'ravi.shah', 'ravi @fastmail.co.uk', 'ravi@@fastmail.co.uk'])(
      'rejects %j with the domain hint',
      (email) => {
        expect(errorsFor({ email }).email).toBe('Add a domain, like name@company.com.');
      },
    );

    it('accepts a valid address with surrounding spaces', () => {
      expect(errorsFor({ email: '  ravi.shah@fastmail.co.uk ' }).email).toBeUndefined();
    });
  });

  describe('LinkedIn profile URL', () => {
    it.each([
      '',
      '   ',
      'https://www.linkedin.com/in/ravi-shah',
      'http://linkedin.com/in/ravi',
      'www.linkedin.com/in/ravi',
      ' https://www.linkedin.com/in/ravi-shah ',
    ])('accepts %j', (linkedInUrl) => {
      expect(errorsFor({ linkedInUrl }).linkedInUrl).toBeUndefined();
    });

    it.each(['ravi shah', 'linkedin', 'mailto:ravi@x.com', 'ftp://linkedin.com/in/ravi'])(
      'rejects %j',
      (linkedInUrl) => {
        expect(errorsFor({ linkedInUrl }).linkedInUrl).toBe(
          'Enter a full web address, like https://www.linkedin.com/in/your-name.',
        );
      },
    );
  });

  describe('CV', () => {
    it('requires a CV', () => {
      expect(errorsFor({ cv: null }).cv).toBe('Attach your CV to apply.');
    });

    it('applies the file type and size rules', () => {
      expect(errorsFor({ cv: { fileName: 'photo.png', sizeBytes: 1000 } }).cv).toBe(
        'Choose a PDF, DOC or DOCX file.',
      );
    });
  });

  describe('cover note', () => {
    it.each(['', '    '])('requires a note (%j)', (coverNote) => {
      expect(errorsFor({ coverNote }).coverNote).toBe('Add a short cover note.');
    });

    it('rejects 49 characters after trimming', () => {
      expect(errorsFor({ coverNote: `  ${NOTE_50.slice(1)}  ` }).coverNote).toBe(
        'Tell us a little more: at least 50 characters.',
      );
    });

    it('accepts exactly 50 and exactly 500 characters', () => {
      expect(errorsFor({ coverNote: NOTE_50 }).coverNote).toBeUndefined();
      expect(errorsFor({ coverNote: 'a'.repeat(500) }).coverNote).toBeUndefined();
    });

    it('rejects more than 500 characters', () => {
      expect(errorsFor({ coverNote: 'a'.repeat(501) }).coverNote).toBeDefined();
    });
  });
});

describe('validateCvFile', () => {
  it.each(['cv.pdf', 'cv.doc', 'cv.docx', 'CV.PDF', 'Ravi.Shah.Docx'])('accepts %j', (fileName) => {
    expect(validateCvFile({ fileName, sizeBytes: 1000 })).toBeNull();
  });

  it.each(['photo.png', 'cv.pdf.exe', 'cv', 'cv.txt'])('rejects the type of %j', (fileName) => {
    expect(validateCvFile({ fileName, sizeBytes: 1000 })).toBe('Choose a PDF, DOC or DOCX file.');
  });

  it('accepts exactly 10MB and rejects one byte more', () => {
    expect(validateCvFile({ fileName: 'cv.pdf', sizeBytes: TEN_MB })).toBeNull();
    expect(validateCvFile({ fileName: 'cv.pdf', sizeBytes: TEN_MB + 1 })).toBe(
      'That file is over 10MB. Try a smaller one.',
    );
  });

  it('reports the type before the size', () => {
    expect(validateCvFile({ fileName: 'huge.png', sizeBytes: TEN_MB + 1 })).toBe(
      'Choose a PDF, DOC or DOCX file.',
    );
  });
});

describe('errorSummary', () => {
  it('uses the singular copy for one error', () => {
    expect(errorSummary(1)).toBe('One thing needs fixing before you can send this.');
  });

  it('uses the plural copy for several errors', () => {
    expect(errorSummary(3)).toBe('A few things need fixing before you can send this.');
  });
});
