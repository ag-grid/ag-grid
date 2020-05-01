export interface IDateTimeListModel {
    getPage(base: Date, number: number): Page;
    roundToValue(date: Date): Date;
}
export interface Page {
    title: string;
    columns: Column[];
    entries: Entry[][];
}
export interface Column {
    label: string;
}
export interface Entry {
    label: string;
    value: Date;
    isPadding?: boolean;
}
export interface IDateTimeListModelOptions {
    startOfPeriod(date: Date, offset: number): Date;
    roundToValue(date: Date): Date;
    valueInPeriod(start: Date, offset: number): Date;
    periodLength(start: Date): number;
    entryLabel(value: Date): string;
    columnCount(first: Date): number;
    columnForValue(value: Date): number;
    columnTitle(value: Date): string;
}
export declare class DateTimeListModel implements IDateTimeListModel {
    private options;
    constructor(options?: IDateTimeListModelOptions);
    getPage(date: Date, offset: number): Page;
    roundToValue(date: Date): Date;
}
