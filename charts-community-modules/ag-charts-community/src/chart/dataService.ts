interface Series {
    id: string;
    type: string;
    toggleSeriesItem(itemId: string, enabled: boolean): void;
    toggleOtherSeriesItems(
        series: { id: string; type: string },
        itemId: string,
        enabled?: boolean,
        preferredEnabled?: boolean
    ): void;
    getLegendData(): any[];
}

type SeriesGetter = () => Series[];

export class DataService {
    readonly getSeries: SeriesGetter;

    constructor(getSeries: SeriesGetter) {
        this.getSeries = getSeries;
    }
}
