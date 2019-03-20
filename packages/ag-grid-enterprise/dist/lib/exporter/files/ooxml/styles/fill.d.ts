// ag-grid-enterprise v20.2.0
import { ExcelOOXMLTemplate } from 'ag-grid-community';
declare const fillFactory: ExcelOOXMLTemplate;
export default fillFactory;
export interface Fill {
    patternType: string;
    fgTheme?: string;
    fgTint?: string;
    fgRgb?: string;
    bgIndexed?: string;
    bgRgb?: string;
}
