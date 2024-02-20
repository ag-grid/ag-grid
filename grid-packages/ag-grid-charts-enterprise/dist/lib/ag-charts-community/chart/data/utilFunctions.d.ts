export type ContinuousDomain<T extends number | Date> = [T, T];
export declare function extendDomain<T extends number | Date>(values: T[], domain?: ContinuousDomain<T>): ContinuousDomain<T>;
