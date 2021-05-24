// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ColGroupDef } from "../../entities/colDef";
import { ColumnGroup } from "../../entities/columnGroup";
import { DragItem } from "../../dragAndDrop/dragAndDropService";
import { AbstractHeaderWrapper } from "../header/abstractHeaderWrapper";
import { Beans } from "../../rendering/beans";
import { ITooltipParams } from "../../rendering/tooltipComponent";
export declare class HeaderGroupWrapperComp extends AbstractHeaderWrapper {
    private static TEMPLATE;
    private columnController;
    private horizontalResizeService;
    private dragAndDropService;
    private userComponentFactory;
    protected beans: Beans;
    private gridApi;
    private columnApi;
    protected readonly column: ColumnGroup;
    protected readonly pinned: string | null;
    private eHeaderCellResize;
    private resizeCols;
    private resizeStartWidth;
    private resizeRatios;
    private resizeTakeFromCols;
    private resizeTakeFromStartWidth;
    private resizeTakeFromRatios;
    private expandable;
    private removeChildListenersFuncs;
    constructor(columnGroup: ColumnGroup, pinned: string | null);
    protected postConstruct(): void;
    protected onFocusIn(e: FocusEvent): void;
    protected handleKeyDown(e: KeyboardEvent): void;
    protected onTabKeyDown(): void;
    private setupExpandable;
    private refreshExpanded;
    private setupMovingCss;
    getComponentHolder(): ColGroupDef | null;
    getTooltipParams(): ITooltipParams;
    private setupTooltip;
    private onColumnMovingChanged;
    private addAttributes;
    private appendHeaderGroupComp;
    private afterHeaderCompCreated;
    private addClasses;
    private setupMove;
    getDragItemForGroup(): DragItem;
    private isSuppressMoving;
    private setupWidth;
    private onDisplayedChildrenChanged;
    private addListenersToChildrenColumns;
    private removeListenersOnChildrenColumns;
    private onWidthChanged;
    private setupResize;
    onResizeStart(shiftKey: boolean): void;
    onResizing(finished: boolean, resizeAmount: any): void;
    private normaliseDragChange;
}
