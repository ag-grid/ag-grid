import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
declare const protectionFactory: ExcelOOXMLTemplate;
export interface Protection {
    locked: boolean;
    hidden: boolean;
}
export default protectionFactory;
