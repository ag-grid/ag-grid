// Type definitions for ag-grid v12.0.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { ICellRenderer, ICellRendererParams } from "./iCellRenderer";
export interface GroupCellRendererParams extends ICellRendererParams {
    pinned: string;
    padding: number;
    suppressPadding: boolean;
    innerRenderer: any;
    footerValueGetter: any;
    suppressCount: boolean;
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
    private eExpanded;
    private eContracted;
    private eCheckbox;
    private eValue;
    private eChildCount;
    private params;
    private draggedFromHideOpenParents;
    private displayedGroup;
    constructor();
    init(params: GroupCellRendererParams): void;
    private setupComponents();
    private embeddedRowMismatch();
    private setPadding();
    private addPadding();
    private addValueElement();
    private createFromInnerRenderer();
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
    onExpandOrContract(): void;
    private showExpandAndContractIcons();
    refresh(): boolean;
}
