export interface IOlympicData {
    athlete: string;
    country: string;
    gold: number;
    silver: number;
    bronze: number;
    [key: string]: string | number;
}
