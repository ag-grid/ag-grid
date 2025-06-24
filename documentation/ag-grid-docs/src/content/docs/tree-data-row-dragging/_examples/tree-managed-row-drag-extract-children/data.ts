export type Task = {
    id: string;
    title: string;
    assignee?: string;
    children?: Task[];
};

export function getData(): Task[] {
    return [
        {
            id: '1',
            title: 'Launch Website',
            assignee: 'Alice',
            children: [
                {
                    id: '2',
                    title: 'Design Landing Page',
                    assignee: 'Bob',
                },
                {
                    id: '3',
                    title: 'Implement Backend',
                    assignee: 'Carol',
                    children: [
                        {
                            id: '4',
                            title: 'Set Up Database',
                            assignee: 'David',
                        },
                        {
                            id: '5',
                            title: 'API Endpoints',
                            assignee: 'Eve',
                            children: [
                                {
                                    id: '6',
                                    title: 'User Auth',
                                    assignee: 'Frank',
                                },
                                {
                                    id: '7',
                                    title: 'Payment Integration',
                                    assignee: 'Grace',
                                },
                            ],
                        },
                        {
                            id: '18',
                            title: 'Server Deployment',
                            assignee: 'Yvonne',
                        },
                    ],
                },
                {
                    id: '8',
                    title: 'Testing',
                    assignee: 'Heidi',
                },
                {
                    id: '15',
                    title: 'SEO Optimization',
                    assignee: 'Trent',
                    children: [
                        {
                            id: '16',
                            title: 'Keyword Research',
                            assignee: 'Victor',
                        },
                        {
                            id: '17',
                            title: 'On-Page SEO',
                            assignee: 'Walter',
                        },
                    ],
                },
            ],
        },
        {
            id: '9',
            title: 'Mobile App',
            assignee: 'Ivan',
            children: [
                {
                    id: '10',
                    title: 'UI Design',
                    assignee: 'Judy',
                },
                {
                    id: '11',
                    title: 'Push Notifications',
                    assignee: 'Mallory',
                },
                {
                    id: '19',
                    title: 'App Store Submission',
                    assignee: 'Zara',
                },
            ],
        },
        {
            id: '12',
            title: 'Marketing Campaign',
            assignee: 'Oscar',
            children: [
                {
                    id: '13',
                    title: 'Social Media',
                    assignee: 'Peggy',
                },
                {
                    id: '14',
                    title: 'Email Outreach',
                    assignee: 'Sybil',
                },
                {
                    id: '20',
                    title: 'Content Creation',
                    assignee: 'Uma',
                },
            ],
        },
    ];
}
