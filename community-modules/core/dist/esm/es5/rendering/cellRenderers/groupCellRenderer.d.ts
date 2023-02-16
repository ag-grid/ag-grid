// Type definitions for @ag-grid-community/core v29.1.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { GroupCellRendererParams } from "./groupCellRendererCtrl";
import { ICellRendererComp } from "./iCellRenderer";
export declare class GroupCellRenderer extends Component implements ICellRendererComp {
    private static TEMPLATE;
    private eExpanded;
    private eContracted;
    private eCheckbox;
    private eValue;
    private eChildCount;
    private innerCellRenderer;
    constructor();
    init(params: GroupCellRendererParams): void;
    private setRenderDetails;
    destroy(): void;
    refresh(): boolean;
}
