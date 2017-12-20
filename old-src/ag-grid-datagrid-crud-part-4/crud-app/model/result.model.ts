import {Sport} from './sport.model';

export class Result {
    id: number;
    version: number;
    age: number;
    year: number;
    date: string;
    gold: number;
    silver: number;
    bronze: number;
    sport: Sport;
}
