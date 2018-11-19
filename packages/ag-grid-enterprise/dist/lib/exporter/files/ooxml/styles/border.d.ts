// ag-grid-enterprise v19.1.3
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const borderFactory: ExcelOOXMLTemplate;
export default borderFactory;
export declare const convertLegacyBorder: (type: string, weight: number) => string;
export interface Border {
    style: string;
    color: string;
}
export interface BorderSet {
    left: Border;
    right: Border;
    top: Border;
    bottom: Border;
    diagonal: Border;
}
//# sourceMappingURL=border.d.ts.map