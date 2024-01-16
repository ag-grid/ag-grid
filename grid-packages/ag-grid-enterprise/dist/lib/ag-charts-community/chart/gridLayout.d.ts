import type { AgChartLegendOrientation } from '../options/agChartOptions';
import type { BBox } from '../scene/bbox';
export type Page = {
    columns: Column[];
    pageWidth: number;
    pageHeight: number;
    startIndex: number;
    endIndex: number;
};
type Column = {
    columnWidth: number;
    columnHeight: number;
    indices: number[];
    bboxes: BBox[];
};
export declare function gridLayout({ orientation, bboxes, maxHeight, maxWidth, itemPaddingY, itemPaddingX, forceResult, }: {
    orientation: AgChartLegendOrientation;
    bboxes: BBox[];
    maxHeight: number;
    maxWidth: number;
    itemPaddingY?: number;
    itemPaddingX?: number;
    forceResult?: boolean;
}): {
    pages: Page[];
    maxPageWidth: number;
    maxPageHeight: number;
} | undefined;
export {};
