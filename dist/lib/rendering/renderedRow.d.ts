// Type definitions for ag-grid v4.0.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import { RenderedCell } from "./renderedCell";
import { RowNode } from "../entities/rowNode";
import { RowRenderer } from "./rowRenderer";
import { Column } from "../entities/column";
import { GridCell } from "../entities/gridCell";
export declare class RenderedRow {
    static EVENT_RENDERED_ROW_REMOVED: string;
    private gridOptionsWrapper;
    private columnController;
    private $compile;
    private mainEventService;
    private context;
    private focusedCellController;
    ePinnedLeftRow: HTMLElement;
    ePinnedRightRow: HTMLElement;
    eBodyRow: HTMLElement;
    private eLeftCenterAndRightRows;
    private renderedCells;
    private scope;
    private rowNode;
    private rowIndex;
    private rowIsHeaderThatSpans;
    private cellRendererMap;
    private parentScope;
    private rowRenderer;
    private pinningLeft;
    private pinningRight;
    private eBodyContainer;
    private ePinnedLeftContainer;
    private ePinnedRightContainer;
    private destroyFunctions;
    private renderedRowEventService;
    constructor(parentScope: any, cellRendererMap: {
        [key: string]: any;
    }, rowRenderer: RowRenderer, eBodyContainer: HTMLElement, ePinnedLeftContainer: HTMLElement, ePinnedRightContainer: HTMLElement, node: RowNode, rowIndex: number);
    init(): void;
    private addColumnListener();
    private onColumnChanged(event);
    private refreshCellsIntoRow();
    private ensureCellInCorrectRow(renderedCell);
    private getOrCreateCell(column);
    private addRowSelectedListener();
    private addCellFocusedListener();
    private createContainers();
    private attachContainers();
    onMouseEvent(eventName: string, mouseEvent: MouseEvent, cell: GridCell): void;
    private setTopAndHeightCss();
    private addRowIds();
    addEventListener(eventType: string, listener: Function): void;
    removeEventListener(eventType: string, listener: Function): void;
    softRefresh(): void;
    getRenderedCellForColumn(column: Column): RenderedCell;
    getCellForCol(column: Column): HTMLElement;
    destroy(): void;
    private destroyScope();
    isDataInList(rows: any[]): boolean;
    isGroup(): boolean;
    private createGroupRow();
    private createGroupSpanningEntireRowCell(padding);
    private createChildScopeOrNull(data);
    private addDynamicStyles();
    private createParams();
    private createEvent(event, eventSource);
    private createRowContainer();
    onRowClicked(event: MouseEvent): void;
    getRowNode(): any;
    getRowIndex(): any;
    refreshCells(colIds: string[]): void;
    private addDynamicClasses();
}
