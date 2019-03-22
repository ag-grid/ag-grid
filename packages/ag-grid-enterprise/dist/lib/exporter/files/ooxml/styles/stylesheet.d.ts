// ag-grid-enterprise v20.2.0
import { ExcelOOXMLTemplate, ExcelStyle } from 'ag-grid-community';
export declare const convertLegacyColor: (color: string) => string;
declare const stylesheetFactory: ExcelOOXMLTemplate;
export declare const getStyleId: (name: string) => number;
export declare const registerStyles: (styles: ExcelStyle[]) => void;
export default stylesheetFactory;
