export interface HiringManager {
  readonly name: string;
  readonly title: string;
  readonly initials: string;
}

export interface RoleFacts {
  readonly salary: string;
  readonly location: string;
  readonly contract: string;
  readonly teamSize: string;
  readonly closes: string;
  readonly hiringManager: HiringManager;
}

export interface RoleSection {
  /** `null` for the untitled intro section. */
  readonly heading: string | null;
  readonly paragraphs: readonly string[];
}

export interface JobRole {
  readonly id: string;
  readonly title: string;
  readonly company: string;
  readonly team: string;
  readonly summary: string;
  readonly facts: RoleFacts;
  readonly description: readonly RoleSection[];
  /** Date candidates will hear back by, as shown in the confirmation copy. */
  readonly responseBy: string;
}
