// ag-grid-enterprise v20.2.0
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const numberFormatFactory: ExcelOOXMLTemplate;
export default numberFormatFactory;
export declare const numberFormatMap: {
    [key: string]: number;
};
export interface NumberFormat {
    formatCode: string;
    numFmtId: number;
}
