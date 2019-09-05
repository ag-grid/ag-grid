// Type definitions for ag-grid-community v21.2.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { IToolPanelComp } from "../interfaces/iToolPanel";
export interface ToolPanelDef {
    id: string;
    labelDefault: string;
    labelKey: string;
    iconKey: string;
    toolPanel?: {
        new (): IToolPanelComp;
    } | string;
    toolPanelFramework?: any;
    toolPanelParams?: any;
}
export interface SideBarDef {
    toolPanels?: (ToolPanelDef | string)[];
    defaultToolPanel?: string;
    hiddenByDefault?: boolean;
}
export declare class SideBarDefParser {
    static readonly DEFAULT_COLUMN_COMP: ToolPanelDef;
    static readonly DEFAULT_FILTER_COMP: ToolPanelDef;
    static readonly DEFAULT_BY_KEY: {
        [p: string]: ToolPanelDef;
    };
    static parse(toParse: SideBarDef | string | string[] | boolean): SideBarDef;
    static parseComponents(from: (ToolPanelDef | string)[]): ToolPanelDef[];
}
