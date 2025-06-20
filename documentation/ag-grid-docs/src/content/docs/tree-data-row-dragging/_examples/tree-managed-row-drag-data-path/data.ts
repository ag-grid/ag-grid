export type Task = {
    id: string;
    path: string[];
    title: string;
    assignee?: string;
};

export function getData(): Task[] {
    return [
        { id: '1', path: ['Launch Website'], title: 'Launch Website', assignee: 'Alice' },
        { id: '2', path: ['Launch Website', 'Design Landing Page'], title: 'Design Landing Page', assignee: 'Bob' },
        {
            id: '3',
            path: ['Launch Website', 'Implement Backend', 'Set Up Database'],
            title: 'Set Up Database',
            assignee: 'David',
        },
        {
            id: '4',
            path: ['Launch Website', 'Implement Backend', 'API Endpoints'],
            title: 'API Endpoints',
            assignee: 'Eve',
        },
        {
            id: '5',
            path: ['Launch Website', 'Implement Backend', 'API Endpoints', 'User Auth'],
            title: 'User Auth',
            assignee: 'Frank',
        },
        {
            id: '6',
            path: ['Launch Website', 'Implement Backend', 'API Endpoints', 'Payment Integration'],
            title: 'Payment Integration',
            assignee: 'Grace',
        },
        { id: '7', path: ['Launch Website', 'Testing'], title: 'Testing', assignee: 'Heidi' },
        { id: '8', path: ['Launch Website', 'SEO Optimization'], title: 'SEO Optimization', assignee: 'Trent' },
        {
            id: '9',
            path: ['Launch Website', 'SEO Optimization', 'Keyword Research'],
            title: 'Keyword Research',
            assignee: 'Victor',
        },
        {
            id: '10',
            path: ['Launch Website', 'SEO Optimization', 'On-Page SEO'],
            title: 'On-Page SEO',
            assignee: 'Walter',
        },
        {
            id: '11',
            path: ['Launch Website', 'Implement Backend', 'Server Deployment'],
            title: 'Server Deployment',
            assignee: 'Yvonne',
        },
        { id: '12', path: ['Mobile App'], title: 'Mobile App', assignee: 'Ivan' },
        { id: '13', path: ['Mobile App', 'UI Design'], title: 'UI Design', assignee: 'Judy' },
        { id: '14', path: ['Mobile App', 'Push Notifications'], title: 'Push Notifications', assignee: 'Mallory' },
        { id: '15', path: ['Mobile App', 'App Store Submission'], title: 'App Store Submission', assignee: 'Zara' },
        { id: '16', path: ['Marketing Campaign'], title: 'Marketing Campaign', assignee: 'Oscar' },
        { id: '17', path: ['Marketing Campaign', 'Social Media'], title: 'Social Media', assignee: 'Peggy' },
        { id: '18', path: ['Marketing Campaign', 'Email Outreach'], title: 'Email Outreach', assignee: 'Sybil' },
        { id: '19', path: ['Marketing Campaign', 'Content Creation'], title: 'Content Creation', assignee: 'Uma' },
        {
            id: '20',
            path: ['Launch Website', 'Design Landing Page', 'Mobile', 'Wireframes'],
            title: 'Wireframes',
            assignee: 'Fay',
        },
        {
            id: '21',
            path: ['Launch Website', 'Design Landing Page', 'Mobile', 'Mockups'],
            title: 'Mockups',
            assignee: 'Nina',
        },
        { id: '22', path: ['Mobile App', 'UI Design', 'Dark Mode', 'Contrast'], title: 'Contrast', assignee: 'Omar' },
        {
            id: '23',
            path: ['Mobile App', 'UI Design', 'Accessibility', 'Screen Reader'],
            title: 'Screen Reader',
            assignee: 'Liam',
        },
        {
            id: '24',
            path: ['Marketing Campaign', 'Social Media', 'PhotoShare', 'Stories'],
            title: 'Stories',
            assignee: 'Mona',
        },
        {
            id: '25',
            path: ['Marketing Campaign', 'Social Media', 'QuickPost', 'Threads'],
            title: 'Threads',
            assignee: 'Ned',
        },
    ];
}
