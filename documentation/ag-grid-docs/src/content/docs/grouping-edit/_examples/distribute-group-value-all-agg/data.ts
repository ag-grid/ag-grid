export interface MetricsRecord {
    id: string;
    department: string;
    team: string;
    employee: string;
    salary: number;
    bonus: number;
    projects: number;
    seniority: number;
    score: number;
}

export function getData(): MetricsRecord[] {
    return [
        // Engineering - Frontend
        {
            id: '1',
            department: 'Engineering',
            team: 'Frontend',
            employee: 'Alice',
            salary: 90,
            bonus: 15,
            projects: 3,
            seniority: 5,
            score: 88,
        },
        {
            id: '2',
            department: 'Engineering',
            team: 'Frontend',
            employee: 'Bob',
            salary: 85,
            bonus: 12,
            projects: 2,
            seniority: 3,
            score: 82,
        },
        {
            id: '3',
            department: 'Engineering',
            team: 'Frontend',
            employee: 'Carol',
            salary: 78,
            bonus: 10,
            projects: 4,
            seniority: 2,
            score: 75,
        },

        // Engineering - Backend
        {
            id: '4',
            department: 'Engineering',
            team: 'Backend',
            employee: 'Dave',
            salary: 95,
            bonus: 18,
            projects: 5,
            seniority: 7,
            score: 92,
        },
        {
            id: '5',
            department: 'Engineering',
            team: 'Backend',
            employee: 'Eve',
            salary: 88,
            bonus: 14,
            projects: 3,
            seniority: 4,
            score: 80,
        },
        {
            id: '6',
            department: 'Engineering',
            team: 'Backend',
            employee: 'Fiona',
            salary: 82,
            bonus: 11,
            projects: 4,
            seniority: 3,
            score: 77,
        },

        // Engineering - QA
        {
            id: '7',
            department: 'Engineering',
            team: 'QA',
            employee: 'George',
            salary: 74,
            bonus: 9,
            projects: 3,
            seniority: 3,
            score: 79,
        },
        {
            id: '8',
            department: 'Engineering',
            team: 'QA',
            employee: 'Hannah',
            salary: 71,
            bonus: 8,
            projects: 2,
            seniority: 2,
            score: 73,
        },

        // Sales - Enterprise
        {
            id: '9',
            department: 'Sales',
            team: 'Enterprise',
            employee: 'Ivan',
            salary: 72,
            bonus: 20,
            projects: 6,
            seniority: 6,
            score: 85,
        },
        {
            id: '10',
            department: 'Sales',
            team: 'Enterprise',
            employee: 'Julia',
            salary: 68,
            bonus: 16,
            projects: 4,
            seniority: 3,
            score: 78,
        },
        {
            id: '11',
            department: 'Sales',
            team: 'Enterprise',
            employee: 'Kevin',
            salary: 75,
            bonus: 22,
            projects: 7,
            seniority: 8,
            score: 90,
        },

        // Sales - SMB
        {
            id: '12',
            department: 'Sales',
            team: 'SMB',
            employee: 'Laura',
            salary: 65,
            bonus: 11,
            projects: 3,
            seniority: 2,
            score: 72,
        },
        {
            id: '13',
            department: 'Sales',
            team: 'SMB',
            employee: 'Mike',
            salary: 70,
            bonus: 13,
            projects: 2,
            seniority: 4,
            score: 79,
        },

        // Marketing - Digital
        {
            id: '14',
            department: 'Marketing',
            team: 'Digital',
            employee: 'Nina',
            salary: 77,
            bonus: 14,
            projects: 5,
            seniority: 4,
            score: 86,
        },
        {
            id: '15',
            department: 'Marketing',
            team: 'Digital',
            employee: 'Oscar',
            salary: 73,
            bonus: 12,
            projects: 3,
            seniority: 2,
            score: 76,
        },
        {
            id: '16',
            department: 'Marketing',
            team: 'Digital',
            employee: 'Paula',
            salary: 80,
            bonus: 16,
            projects: 4,
            seniority: 5,
            score: 83,
        },

        // Marketing - Brand
        {
            id: '17',
            department: 'Marketing',
            team: 'Brand',
            employee: 'Quinn',
            salary: 69,
            bonus: 10,
            projects: 2,
            seniority: 1,
            score: 70,
        },
        {
            id: '18',
            department: 'Marketing',
            team: 'Brand',
            employee: 'Rachel',
            salary: 76,
            bonus: 15,
            projects: 3,
            seniority: 3,
            score: 81,
        },
    ];
}
