// Type definitions for ag-grid v8.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
import { Component } from "../../widgets/component";
import { ICellRenderer } from "./iCellRenderer";
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
    private rowNode;
    private rowIndex;
    private gridApi;
    constructor();
    init(params: any): void;
    private isLeaveCellBlank(params);
    private addPadding(params);
    private addValueElement(params);
    private createFromInnerRenderer(params);
    private createFooterCell(params);
    private createGroupCell(params);
    private addChildCount(params);
    private getGroupName(params);
    private createLeafCell(params);
    private isUserWantsSelected(params);
    private addCheckboxIfNeeded(params);
    private addExpandAndContract(eGroupCell);
    private onKeyDown(event);
    onExpandOrContract(): void;
    private showExpandAndContractIcons();
}
