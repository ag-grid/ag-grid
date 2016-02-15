// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import RenderedCell from "./renderedCell";
import { RowNode } from "../entities/rowNode";
import GridOptionsWrapper from "../gridOptionsWrapper";
import { Grid } from "../grid";
import { ColumnController } from "../columnController/columnController";
import ExpressionService from "../expressionService";
import RowRenderer from "./rowRenderer";
import SelectionRendererFactory from "../selectionRendererFactory";
import TemplateService from "../templateService";
import SelectionController from "../selectionController";
import ValueService from "../valueService";
import EventService from "../eventService";
import Column from "../entities/column";
export default class RenderedRow {
    vPinnedLeftRow: any;
    vPinnedRightRow: any;
    vBodyRow: any;
    private renderedCells;
    private scope;
    private node;
    private rowIndex;
    private cellRendererMap;
    private gridOptionsWrapper;
    private parentScope;
    private angularGrid;
    private columnController;
    private expressionService;
    private rowRenderer;
    private selectionRendererFactory;
    private $compile;
    private templateService;
    private selectionController;
    private pinningLeft;
    private pinningRight;
    private eBodyContainer;
    private ePinnedLeftContainer;
    private ePinnedRightContainer;
    private valueService;
    private eventService;
    constructor(gridOptionsWrapper: GridOptionsWrapper, valueService: ValueService, parentScope: any, angularGrid: Grid, columnController: ColumnController, expressionService: ExpressionService, cellRendererMap: {
        [key: string]: any;
    }, selectionRendererFactory: SelectionRendererFactory, $compile: any, templateService: TemplateService, selectionController: SelectionController, rowRenderer: RowRenderer, eBodyContainer: HTMLElement, ePinnedLeftContainer: HTMLElement, ePinnedRightContainer: HTMLElement, node: RowNode, rowIndex: number, eventService: EventService);
    onRowSelected(selected: boolean): void;
    softRefresh(): void;
    getRenderedCellForColumn(column: Column): RenderedCell;
    getCellForCol(column: Column): HTMLElement;
    destroy(): void;
    private destroyScope();
    isDataInList(rows: any[]): boolean;
    isNodeInList(nodes: RowNode[]): boolean;
    isGroup(): boolean;
    private drawNormalRow();
    private bindVirtualElement(vElement);
    private createGroupRow();
    private createGroupSpanningEntireRowCell(padding);
    private createChildScopeOrNull(data);
    private addDynamicStyles();
    private createParams();
    private createEvent(event, eventSource);
    private createRowContainer();
    getRowNode(): any;
    getRowIndex(): any;
    refreshCells(colIds: string[]): void;
    private addDynamicClasses();
}
