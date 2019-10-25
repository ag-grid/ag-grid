import { ExcelOOXMLTemplate } from '@ag-community/grid-core';
declare const protectionFactory: ExcelOOXMLTemplate;
export interface Protection {
    locked: boolean;
    hidden: boolean;
}
export default protectionFactory;
