// Type definitions for ag-grid v13.3.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Component } from "../../widgets/component";
import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
export interface GroupCellRendererParams extends ICellRendererParams {
    pinned: string;
    padding: number;
    suppressPadding: boolean;
    footerValueGetter: any;
    suppressCount: boolean;
    fullWidth: boolean;
    checkbox: any;
    scope: any;
    actualValue: string;
}
export declare class GroupCellRenderer extends Component implements ICellRenderer {
    private static TEMPLATE;
    private gridOptionsWrapper;
    private expressionService;
    private eventService;
    private cellRendererService;
    private valueFormatterService;
    private context;
    private columnController;
    private mouseEventService;
    private eExpanded;
    private eContracted;
    private eCheckbox;
    private eValue;
    private eChildCount;
    private params;
    private draggedFromHideOpenParents;
    private displayedGroup;
    private cellIsBlank;
    constructor();
    init(params: GroupCellRendererParams): void;
    private isEmbeddedRowMismatch();
    private setPadding();
    private addPadding();
    private addValueElement();
    private createFooterCell();
    private createGroupCell();
    private addChildCount();
    private updateChildCount();
    private createLeafCell();
    private isUserWantsSelected();
    private addCheckboxIfNeeded();
    private addExpandAndContract();
    private onKeyDown(event);
    private setupDragOpenParents();
    onExpandClicked(): void;
    onCellDblClicked(event: MouseEvent): void;
    onExpandOrContract(): void;
    private isExpandable();
    private showExpandAndContractIcons();
    refresh(): boolean;
}
