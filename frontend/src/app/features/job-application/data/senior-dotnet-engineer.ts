import { JobRole } from '../models/job-role';

/** Role content, copied verbatim from Design/Job Application Page.dc.html. */
export const SENIOR_DOTNET_ENGINEER: JobRole = {
  id: 'senior-dotnet-engineer',
  title: 'Senior .NET Engineer (Remote, UK)',
  company: 'Northgate Labs',
  team: 'Platform',
  summary: 'Own the .NET services behind our scheduling and messaging products.',
  facts: {
    salary: '£78,000 – £92,000',
    location: 'Remote, UK',
    contract: 'Permanent, full time',
    teamSize: 'Platform, 9 people',
    closes: '29 August 2026',
    hiringManager: { name: 'Dana Kowalski', title: 'Hiring manager', initials: 'DK' },
  },
  description: [
    {
      heading: null,
      paragraphs: [
        'Northgate Labs builds scheduling and messaging software for healthcare providers. The Platform team owns the .NET services that everything else in the product depends on, from appointment booking through to the notification pipeline that sends around 40 million messages a month. We are hiring a senior engineer to help us take those services through their next stage of growth.',
        'You would join a team of nine engineers working in C# on .NET 8, with SQL Server and Azure Service Bus behind the busiest paths. Most of the codebase is well tested and actively maintained; some of it is a 2017 monolith we are decomposing service by service. You would work across both, and have a real say in the order we do it.',
      ],
    },
    {
      heading: "What you'll do",
      paragraphs: [
        'Design, build and run production services end to end, including the parts that are not writing code: shaping the problem with product, writing the design note, and staying with the work after release. You would also improve how we see the system, since our tracing and alerting have not kept pace with the last two years of growth, and support two mid-level engineers through code review and pairing.',
      ],
    },
    {
      heading: "What we're looking for",
      paragraphs: [
        'Several years building and operating production backend systems in C# and .NET, comfort with the trade-offs that come with distributed systems, and clear written communication, because we are a remote team and most decisions get made in writing. Experience with regulated or clinical data is useful but not required. We care more about how you reason through a problem than the exact stack you have used.',
      ],
    },
    {
      heading: 'How we hire',
      paragraphs: [
        'Four stages: a 30-minute call with Dana, a 90-minute technical conversation about a system you have built, a paid half-day working session with the team, and a final chat with our VP of Engineering. We aim to finish within three weeks of your first call, and we give feedback at every stage whether or not you move forward.',
      ],
    },
  ],
  responseBy: '5 September',
};
