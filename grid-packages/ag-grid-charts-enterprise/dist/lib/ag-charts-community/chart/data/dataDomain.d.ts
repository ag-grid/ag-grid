export declare class DataDomain {
    private readonly type;
    private continuousDomain;
    private discreteDomain;
    constructor(type: 'continuous' | 'discrete');
    extend(val: any): void;
    getDomain(): number[] | Set<unknown>;
}
