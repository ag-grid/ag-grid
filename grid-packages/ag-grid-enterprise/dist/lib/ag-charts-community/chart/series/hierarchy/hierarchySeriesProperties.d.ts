import { SeriesProperties } from '../seriesProperties';
export declare abstract class HierarchySeriesProperties<T extends object> extends SeriesProperties<T> {
    childrenKey: string;
    sizeKey?: string;
    colorKey?: string;
    colorName?: string;
    fills: string[];
    strokes: string[];
    colorRange?: string[];
}
