export interface GroupAssignment {
    id: string;
    region: 'East' | 'West' | 'North' | 'South';
    owner: string;
}

export const REGION_LIST: Array<GroupAssignment['region']> = ['East', 'West', 'North', 'South'];

export function getAssignments(): GroupAssignment[] {
    return [
        { id: 'ga-1', region: 'East', owner: 'Jamie' },
        { id: 'ga-2', region: 'East', owner: 'Kira' },
        { id: 'ga-3', region: 'East', owner: 'Lena' },
        { id: 'ga-4', region: 'West', owner: 'Marco' },
        { id: 'ga-5', region: 'West', owner: 'Gus' },
        { id: 'ga-6', region: 'North', owner: 'Olive' },
        { id: 'ga-7', region: 'North', owner: 'Seth' },
        { id: 'ga-8', region: 'South', owner: 'Tara' },
        { id: 'ga-9', region: 'South', owner: 'Uma' },
    ];
}
