import { ExcelOOXMLTemplate, ExcelAlignment, ExcelProtection } from '@ag-grid-community/core';
declare const xfFactory: ExcelOOXMLTemplate;
export default xfFactory;
export interface Xf {
    alignment?: ExcelAlignment;
    borderId: number;
    fillId: number;
    fontId: number;
    numFmtId: number;
    quotePrefix?: number;
    xfId?: number;
    protection?: ExcelProtection;
}
