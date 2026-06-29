export type RoadmapItem = {
    id: string;
    title: string;
    desc: string;
    q: number;
    why: string;
    status: 'planned' | 'in-progress' | 'shipped';
    link: string | null;
};
