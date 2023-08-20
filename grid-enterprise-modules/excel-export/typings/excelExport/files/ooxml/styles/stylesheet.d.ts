import { ExcelOOXMLTemplate, ExcelStyle } from '@ag-grid-community/core';
declare const stylesheetFactory: ExcelOOXMLTemplate;
export declare const getStyleId: (name: string, currentSheet: number) => number;
export declare const registerStyles: (styles: ExcelStyle[], _currentSheet: number) => void;
export default stylesheetFactory;
