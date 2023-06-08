interface FormatterOptions {
    prefix?: string;
    fill?: string;
    align?: string;
    sign?: string;
    symbol?: string;
    zero?: string;
    width?: number;
    comma?: string;
    precision?: number;
    trim?: boolean;
    type?: string;
    suffix?: string;
}
export declare function format(formatter: string | FormatterOptions): (n: number) => string;
export declare function tickFormat(ticks: any[], formatter?: string): (n: number | {
    valueOf(): number;
}) => string;
export {};
