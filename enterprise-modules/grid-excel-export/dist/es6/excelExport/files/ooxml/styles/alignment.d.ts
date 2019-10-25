import { ExcelOOXMLTemplate } from '@ag-community/grid-core';
declare const alignmentFactory: ExcelOOXMLTemplate;
export interface Alignment {
    horizontal: string;
    indent: number;
    readingOrder: number;
    textRotation: number;
    shrinkToFit: boolean;
    vertical: string;
    wrapText: boolean;
}
export default alignmentFactory;
