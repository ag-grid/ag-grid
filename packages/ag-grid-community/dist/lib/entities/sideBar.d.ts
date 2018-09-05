// Type definitions for ag-grid-community v19.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ICellRendererComp, ICellRendererFunc } from "../rendering/cellRenderers/iCellRenderer";
export interface ToolPanelDef {
    id: string;
    labelDefault: string;
    labelKey: string;
    iconKey: string;
    component?: {
        new (): ICellRendererComp;
    } | ICellRendererFunc | string;
    componentFramework?: any;
    componentParams?: any;
}
export interface SideBarDef {
    toolPanels?: (ToolPanelDef | string)[];
    defaultToolPanel?: string;
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
