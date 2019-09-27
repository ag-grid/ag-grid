// ag-grid-enterprise v21.2.2
import { ExcelOOXMLTemplate } from 'ag-grid-community';
export interface NumberFormat {
    formatCode: string;
    numFmtId: number;
}
declare const numberFormatFactory: ExcelOOXMLTemplate;
export default numberFormatFactory;
export declare const numberFormatMap: {
    [key: string]: number;
};
