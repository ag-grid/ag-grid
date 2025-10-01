export type Task = {
    id: string;
    parentId?: string;
    title: string;
    assignee?: string;
};

export function getData(): Task[] {
    return [
        { id: '1', title: 'Launch Website', assignee: 'Alice' },
        { id: '2', parentId: '1', title: 'Design Landing Page', assignee: 'Bob' },
        { id: '3', parentId: '1', title: 'Implement Backend', assignee: 'Carol' },
        { id: '4', parentId: '3', title: 'Set Up Database', assignee: 'David' },
        { id: '5', parentId: '3', title: 'API Endpoints', assignee: 'Eve' },
        { id: '6', parentId: '5', title: 'User Auth', assignee: 'Frank' },
        { id: '7', parentId: '5', title: 'Payment Integration', assignee: 'Grace' },
        { id: '8', parentId: '1', title: 'Testing', assignee: 'Heidi' },
        { id: '9', title: 'Mobile App', assignee: 'Ivan' },
        { id: '10', parentId: '9', title: 'UI Design', assignee: 'Judy' },
        { id: '11', parentId: '9', title: 'Push Notifications', assignee: 'Mallory' },
        { id: '12', title: 'Marketing Campaign', assignee: 'Oscar' },
        { id: '13', parentId: '12', title: 'Social Media', assignee: 'Peggy' },
        { id: '14', parentId: '12', title: 'Email Outreach', assignee: 'Sybil' },
        { id: '15', parentId: '1', title: 'SEO Optimization', assignee: 'Trent' },
        { id: '16', parentId: '15', title: 'Keyword Research', assignee: 'Victor' },
        { id: '17', parentId: '15', title: 'On-Page SEO', assignee: 'Walter' },
        { id: '18', parentId: '3', title: 'Server Deployment', assignee: 'Yvonne' },
        { id: '19', parentId: '9', title: 'App Store Submission', assignee: 'Zara' },
        { id: '20', parentId: '12', title: 'Content Creation', assignee: 'Uma' },
    ];
}
