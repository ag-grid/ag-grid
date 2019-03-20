// ag-grid-enterprise v20.2.0
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const protectionFactory: ExcelOOXMLTemplate;
export interface Protection {
    locked: boolean;
    hidden: boolean;
}
export default protectionFactory;
