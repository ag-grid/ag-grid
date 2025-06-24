export type Task = {
    id: string;
    path: string[];
    assignee?: string;
};

export function getData(): Task[] {
    return [
        { id: '1', path: ['Launch Website'], assignee: 'Alice' },
        { id: '2', path: ['Launch Website', 'Design Landing Page'], assignee: 'Bob' },
        { id: '3', path: ['Launch Website', 'Implement Backend'], assignee: 'Carol' },
        {
            id: '4',
            path: ['Launch Website', 'Implement Backend', 'Set Up Database'],
            assignee: 'David',
        },
        {
            id: '5',
            path: ['Launch Website', 'Implement Backend', 'API Endpoints'],
            assignee: 'Eve',
        },
        {
            id: '6',
            path: ['Launch Website', 'Implement Backend', 'API Endpoints', 'User Auth'],
            assignee: 'Frank',
        },
        {
            id: '7',
            path: ['Launch Website', 'Implement Backend', 'API Endpoints', 'Payment Integration'],
            assignee: 'Grace',
        },
        { id: '8', path: ['Launch Website', 'Testing'], assignee: 'Heidi' },
        { id: '9', path: ['Mobile App'], assignee: 'Ivan' },
        { id: '10', path: ['Mobile App', 'UI Design'], assignee: 'Judy' },
        { id: '11', path: ['Mobile App', 'Push Notifications'], assignee: 'Mallory' },
        { id: '12', path: ['Marketing Campaign'], assignee: 'Oscar' },
        { id: '13', path: ['Marketing Campaign', 'Social Media'], assignee: 'Peggy' },
        { id: '14', path: ['Marketing Campaign', 'Email Outreach'], assignee: 'Sybil' },
        { id: '15', path: ['Launch Website', 'SEO Optimization'], assignee: 'Trent' },
        {
            id: '16',
            path: ['Launch Website', 'SEO Optimization', 'Keyword Research'],
            assignee: 'Victor',
        },
        {
            id: '17',
            path: ['Launch Website', 'SEO Optimization', 'On-Page SEO'],
            assignee: 'Walter',
        },
        {
            id: '18',
            path: ['Launch Website', 'Implement Backend', 'Server Deployment'],
            assignee: 'Yvonne',
        },
        { id: '19', path: ['Mobile App', 'App Store Submission'], assignee: 'Zara' },
        { id: '20', path: ['Marketing Campaign', 'Content Creation'], assignee: 'Uma' },
    ];
}
