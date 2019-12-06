import { ExcelOOXMLTemplate } from '@ag-grid-community/core';
declare const fontFactory: ExcelOOXMLTemplate;
export default fontFactory;
export declare const getFamilyId: (name: string) => number;
export interface Font {
    name: string;
    size?: number;
    color?: string;
    colorTheme?: string;
    family?: number;
    scheme?: string;
    italic?: boolean;
    bold?: boolean;
    strike?: boolean;
    outline?: boolean;
    shadow?: boolean;
    underline?: string;
}
