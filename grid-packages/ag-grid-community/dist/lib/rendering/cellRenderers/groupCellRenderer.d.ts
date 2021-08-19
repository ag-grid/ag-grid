import { Component } from "../../widgets/component";
import { GroupCellRendererParams } from "./groupCellRendererCtrl";
import { ICellRendererComp } from "./iCellRenderer";
export declare class GroupCellRenderer extends Component implements ICellRendererComp {
    private static TEMPLATE;
    private userComponentFactory;
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
