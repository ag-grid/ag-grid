// ag-grid-enterprise v21.2.2
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const alignmentFactory: ExcelOOXMLTemplate;
export interface Alignment {
    horizontal: string;
    indent: number;
    readingOrder: number;
    textRotation: number;
    shrinkToFit: boolean;
    vertical: string;
    wrapText: boolean;
}
export default alignmentFactory;
