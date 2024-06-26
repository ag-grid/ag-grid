import type { GroupCellRendererParams, ICellRendererComp } from 'ag-grid-community';
import { Component } from 'ag-grid-community';
export declare class GroupCellRenderer extends Component implements ICellRendererComp {
    private readonly eExpanded;
    private readonly eContracted;
    private readonly eCheckbox;
    private readonly eValue;
    private readonly eChildCount;
    private innerCellRenderer;
    constructor();
    init(params: GroupCellRendererParams): void;
    private setRenderDetails;
    destroy(): void;
    refresh(): boolean;
}
