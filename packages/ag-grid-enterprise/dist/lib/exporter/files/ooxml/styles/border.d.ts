// ag-grid-enterprise v21.2.2
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const borderFactory: ExcelOOXMLTemplate;
export default borderFactory;
export declare const convertLegacyBorder: (type: string, weight: number) => string;
export interface Border {
    style: string | undefined;
    color: string | undefined;
}
export interface BorderSet {
    left: Border | undefined;
    right: Border | undefined;
    top: Border | undefined;
    bottom: Border | undefined;
    diagonal: Border | undefined;
}
