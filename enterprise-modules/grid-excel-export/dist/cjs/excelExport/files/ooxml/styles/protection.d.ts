import { ExcelOOXMLTemplate } from '@ag-grid-community/grid-core';
declare const protectionFactory: ExcelOOXMLTemplate;
export interface Protection {
    locked: boolean;
    hidden: boolean;
}
export default protectionFactory;
