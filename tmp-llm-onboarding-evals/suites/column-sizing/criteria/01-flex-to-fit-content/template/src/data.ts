export interface Employee {
    id: number;
    name: string;
    email: string;
    role: string;
    department: string;
    location: string;
    startDate: string;
    salary: number;
    comments: string;
}

const FIRST = ['Ada', 'Grace', 'Alan', 'Katherine', 'Linus', 'Barbara', 'Dennis', 'Margaret', 'Tim', 'Radia'];

const LAST = [
    'Lovelace',
    'Hopper',
    'Turing',
    'Johnson',
    'Torvalds',
    'Liskov',
    'Ritchie',
    'Hamilton',
    'Berners-Lee',
    'Perlman',
];

const ROLES = [
    'Engineer',
    'Senior Software Engineer',
    'Staff Engineer',
    'Engineering Manager',
    'Principal Platform Architect',
    'Account Executive',
    'Regional Sales Director',
    'Support Specialist',
    'Financial Analyst',
    'Head of Marketing Operations',
];

const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'Support', 'Finance'];

const LOCATIONS = ['London', 'Berlin', 'New York', 'Singapore', 'São Paulo', 'Cape Town'];

const COMMENTS = [
    'Joined from the platform team and now looks after the ingestion pipeline end to end, including the nightly reconciliation job and its alerting.',
    'On a phased return and working three days a week until the end of the quarter, at which point the arrangement will be reviewed with their manager.',
    'Owns the relationship with our two largest accounts in the region and is the named escalation contact for both of them out of hours.',
    'Completed the internal leadership programme last spring and is currently mentoring two new starters alongside their normal delivery work.',
    'Covering for the team lead during parental leave; the arrangement is reviewed at the next cycle and may be made permanent if it works out.',
    'Relocated from the London office last year and is now the main point of contact for everything the local team needs from head office.',
];

function pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

export function makeEmployees(count: number): Employee[] {
    const rows: Employee[] = [];
    for (let i = 0; i < count; i++) {
        const first = FIRST[i % FIRST.length];
        const last = LAST[Math.floor(i / FIRST.length) % LAST.length];
        rows.push({
            id: 1000 + i,
            name: `${first} ${last}`,
            email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
            role: ROLES[i % ROLES.length],
            department: DEPARTMENTS[i % DEPARTMENTS.length],
            location: LOCATIONS[i % LOCATIONS.length],
            startDate: `${2015 + (i % 10)}-${pad((i % 12) + 1)}-${pad(((i * 7) % 27) + 1)}`,
            salary: 35000 + ((i * 1337) % 90000),
            comments: COMMENTS[i % COMMENTS.length],
        });
    }
    return rows;
}

/**
 * Rows for the live feed. Job titles get steadily longer as the sequence goes on, so a column
 * sized once at start-up stops being wide enough for what arrives later.
 */
export function makeIncomingEmployee(sequence: number): Employee {
    const base = makeEmployees(sequence + 1)[sequence];
    const suffixes = [
        '',
        ', Data Platform',
        ', Data Platform and Reporting',
        ', Data Platform, Reporting and Analytics',
        ', Data Platform, Reporting, Analytics and Insight',
    ];
    return {
        ...base,
        id: 9000 + sequence,
        role: base.role + suffixes[Math.min(sequence, suffixes.length - 1)],
    };
}
