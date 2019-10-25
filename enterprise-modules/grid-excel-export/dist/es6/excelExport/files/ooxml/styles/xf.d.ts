import { ExcelOOXMLTemplate, ExcelAlignment, ExcelProtection } from '@ag-community/grid-core';
declare const xfFactory: ExcelOOXMLTemplate;
export default xfFactory;
export interface Xf {
    alignment?: ExcelAlignment;
    borderId: number;
    fillId: number;
    fontId: number;
    numFmtId: number;
    xfId?: number;
    protection?: ExcelProtection;
}
