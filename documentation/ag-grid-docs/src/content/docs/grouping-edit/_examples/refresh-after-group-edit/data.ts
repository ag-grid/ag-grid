export interface GroupAssignment {
    id: string;
    region: 'East' | 'West' | 'North' | 'South';
    pod: string;
    owner: string;
    backlog: number;
    focus: string;
}

export const REGION_LIST: Array<GroupAssignment['region']> = ['East', 'West', 'North', 'South'];

export function getAssignments(): GroupAssignment[] {
    return [
        {
            id: 'ga-1',
            region: 'East',
            pod: 'Onboarding',
            owner: 'Jamie',
            backlog: 18,
            focus: 'Rollout partner toolkit',
        },
        { id: 'ga-2', region: 'East', pod: 'Onboarding', owner: 'Kira', backlog: 11, focus: 'Site readiness calls' },
        { id: 'ga-3', region: 'East', pod: 'Expansion', owner: 'Lena', backlog: 9, focus: 'Metro launch study' },
        { id: 'ga-4', region: 'West', pod: 'Expansion', owner: 'Marco', backlog: 7, focus: 'Harbor permits' },
        { id: 'ga-5', region: 'West', pod: 'Retention', owner: 'Gus', backlog: 5, focus: 'VIP retention pack' },
        { id: 'ga-6', region: 'North', pod: 'Retention', owner: 'Olive', backlog: 12, focus: 'Reactivation sprint' },
        { id: 'ga-7', region: 'North', pod: 'Enablement', owner: 'Seth', backlog: 6, focus: 'Docs refresh' },
        { id: 'ga-8', region: 'South', pod: 'Enablement', owner: 'Tara', backlog: 10, focus: 'Trainer certification' },
        { id: 'ga-9', region: 'South', pod: 'Enablement', owner: 'Uma', backlog: 8, focus: 'Playbook sync' },
    ];
}
