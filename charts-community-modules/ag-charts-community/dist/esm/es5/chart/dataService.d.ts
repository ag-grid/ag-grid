interface Series {
    id: string;
    type: string;
    getLegendData(): any[];
}
declare type SeriesGetter = () => Series[];
export declare class DataService {
    readonly getSeries: SeriesGetter;
    constructor(getSeries: SeriesGetter);
}
export {};
//# sourceMappingURL=dataService.d.ts.map