import { ExcelOOXMLTemplate } from '@ag-community/grid-core';
export interface NumberFormat {
    formatCode: string;
    numFmtId: number;
}
declare const numberFormatFactory: ExcelOOXMLTemplate;
export default numberFormatFactory;
export declare const numberFormatMap: {
    [key: string]: number;
};
