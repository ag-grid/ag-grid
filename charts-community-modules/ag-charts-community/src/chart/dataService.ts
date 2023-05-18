interface Series {
    id: string;
    type: string;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
    getLegendData(): any[];
}

type SeriesGetter = () => Series[];

export class DataService {
    readonly getSeries: SeriesGetter;

    constructor(getSeries: SeriesGetter) {
        this.getSeries = getSeries;
    }
}
