type NumberFormat = {
    locales?: string | string[];
    options?: any;
};
type DateFormat = string;
type ValueFormat = NumberFormat | DateFormat;
export declare function interpolate(input: string, values: {
    [key in string]: any;
}, formats?: {
    [key in string]: ValueFormat;
}): string;
export {};
