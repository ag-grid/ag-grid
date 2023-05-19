interface Series {
    id: string;
    type: string;
    getLegendData(): any[];
}

type SeriesGetter = () => Series[];

export class DataService {
    readonly getSeries: SeriesGetter;

    constructor(getSeries: SeriesGetter) {
        this.getSeries = getSeries;
    }
}
