import type { BBox } from '../scene/bbox';
import type { AgChartOrientation } from './agChartOptions';
export declare type Page = {
    columns: Column[];
    pageWidth: number;
    pageHeight: number;
    startIndex: number;
    endIndex: number;
};
declare type Column = {
    columnWidth: number;
    columnHeight: number;
    indices: number[];
    bboxes: BBox[];
};
export declare function gridLayout({ orientation, bboxes, maxHeight, maxWidth, itemPaddingY, itemPaddingX, forceResult, }: {
    orientation: AgChartOrientation;
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
//# sourceMappingURL=gridLayout.d.ts.map