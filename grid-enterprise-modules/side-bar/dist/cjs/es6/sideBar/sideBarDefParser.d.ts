import { SideBarDef, ToolPanelDef } from "@ag-grid-community/core";
export declare class SideBarDefParser {
    static readonly DEFAULT_COLUMN_COMP: ToolPanelDef;
    static readonly DEFAULT_FILTER_COMP: ToolPanelDef;
    static readonly DEFAULT_BY_KEY: {
        [p: string]: ToolPanelDef;
    };
    static parse(toParse: SideBarDef | string | string[] | boolean | null | undefined): SideBarDef | undefined;
    static parseComponents(from?: (ToolPanelDef | string)[]): ToolPanelDef[];
}
