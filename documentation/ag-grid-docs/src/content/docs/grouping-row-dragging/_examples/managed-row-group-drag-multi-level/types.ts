export interface IAthlete {
    id: string;
    athlete: string;
    age: number | null;
    country: string | null;
    year: number;
    date: string | null;
    sport: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}
