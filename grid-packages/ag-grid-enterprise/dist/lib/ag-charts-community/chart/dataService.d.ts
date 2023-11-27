export declare class DataService<TSeries> {
    readonly getSeries: () => TSeries[];
    constructor(getSeries: () => TSeries[]);
}
