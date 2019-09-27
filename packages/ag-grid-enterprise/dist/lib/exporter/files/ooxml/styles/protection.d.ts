// ag-grid-enterprise v21.2.2
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const protectionFactory: ExcelOOXMLTemplate;
export interface Protection {
    locked: boolean;
    hidden: boolean;
}
export default protectionFactory;
