export interface WorkItem {
    id: string;
    team: string;
    priority: 'High' | 'Medium' | 'Low';
    task: string;
    owner: string;
    status: 'Blocked' | 'In Progress' | 'Ready';
}

export function getWorkItems(): WorkItem[] {
    return [
        {
            id: '1',
            team: 'Support',
            priority: 'High',
            task: 'Reset travel portal',
            owner: 'Mira',
            status: 'In Progress',
        },
        {
            id: '2',
            team: 'Support',
            priority: 'Medium',
            task: 'Update expense policy FAQ',
            owner: 'Uli',
            status: 'Ready',
        },
        { id: '3', team: 'Support', priority: 'Low', task: 'Prepare onboarding deck', owner: 'Mira', status: 'Ready' },
        {
            id: '4',
            team: 'Field Ops',
            priority: 'High',
            task: 'Schedule driver retraining',
            owner: 'Otto',
            status: 'Blocked',
        },
        {
            id: '5',
            team: 'Field Ops',
            priority: 'Medium',
            task: 'Audit depot signage',
            owner: 'Cal',
            status: 'In Progress',
        },
        { id: '6', team: 'Field Ops', priority: 'Low', task: 'Refresh PPE inventory', owner: 'Otto', status: 'Ready' },
        {
            id: '7',
            team: 'Dispatch',
            priority: 'High',
            task: 'Escalate late route 44',
            owner: 'Ivy',
            status: 'In Progress',
        },
        {
            id: '8',
            team: 'Dispatch',
            priority: 'Medium',
            task: 'Sync ETA feed with partner',
            owner: 'Theo',
            status: 'Ready',
        },
        {
            id: '9',
            team: 'Dispatch',
            priority: 'Low',
            task: 'Publish weekend maintenance note',
            owner: 'Ivy',
            status: 'Ready',
        },
    ];
}
