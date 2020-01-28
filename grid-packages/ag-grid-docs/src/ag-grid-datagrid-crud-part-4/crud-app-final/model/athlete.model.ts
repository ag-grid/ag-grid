import {Country} from './country.model';
import {Result} from './result.model';

export class Athlete {
    id: number;
    version: number;
    name: string;
    country: Country;
    results: Result[];
}
