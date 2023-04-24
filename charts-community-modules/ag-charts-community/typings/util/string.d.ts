declare type NumberFormat = {
    locales?: string | string[];
    options?: any;
};
declare type DateFormat = string;
declare type ValueFormat = NumberFormat | DateFormat;
export declare function interpolate(input: string, values: {
    [key in string]: any;
}, formats?: {
    [key in string]: ValueFormat;
}): string;
export {};
