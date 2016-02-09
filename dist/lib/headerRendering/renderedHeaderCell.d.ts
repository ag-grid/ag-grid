// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import RenderedHeaderElement from "./renderedHeaderElement";
import Column from "../entities/column";
import RenderedHeaderGroupCell from "./renderedHeaderGroupCell";
import FilterManager from "../filter/filterManager";
import { ColumnController } from "../columnController/columnController";
import { Grid } from "../grid";
import HeaderTemplateLoader from "./headerTemplateLoader";
import GridOptionsWrapper from "../gridOptionsWrapper";
import { DragService } from "./dragService";
import HeaderRenderer from "./headerRenderer";
import GridPanel from "../gridPanel/gridPanel";
export default class RenderedHeaderCell extends RenderedHeaderElement {
    private static DEFAULT_SORTING_ORDER;
    private parentGroup;
    private eHeaderCell;
    private eSortAsc;
    private eSortDesc;
    private eSortNone;
    private eFilterIcon;
    private eText;
    private eHeaderCellLabel;
    private column;
    private childScope;
    private filterManager;
    private columnController;
    private $compile;
    private grid;
    private headerTemplateLoader;
    private headerRenderer;
    private startWidth;
    private destroyFunctions;
    constructor(column: Column, parentGroup: RenderedHeaderGroupCell, gridOptionsWrapper: GridOptionsWrapper, parentScope: any, filterManager: FilterManager, columnController: ColumnController, $compile: any, grid: Grid, eRoot: HTMLElement, headerTemplateLoader: HeaderTemplateLoader, headerRenderer: HeaderRenderer, dragService: DragService, gridPanel: GridPanel);
    getGui(): HTMLElement;
    destroy(): void;
    private createScope(parentScope);
    private addAttributes();
    private addMenu();
    private removeSortIcons();
    private addSortIcons();
    private addMovingCss();
    private setupComponents(eRoot, parentScope, dragService, gridPanel);
    private addSort();
    private addMove(eRoot, dragService, gridPanel);
    private addResize(eRoot, dragService);
    private useRenderer(headerNameValue, headerCellRenderer);
    refreshFilterIcon(): void;
    refreshSortIcon(): void;
    private getNextSortDirection();
    private addSortHandling();
    onDragStart(): void;
    onDragging(dragChange: number, finished: boolean): void;
    onIndividualColumnResized(column: Column): void;
}
