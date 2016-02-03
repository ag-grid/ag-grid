// Type definitions for ag-grid v3.3.0-alpha.1
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
export default class RenderedHeaderCell extends RenderedHeaderElement {
    private static DEFAULT_SORTING_ORDER;
    private parentGroup;
    private eHeaderCell;
    private eSortAsc;
    private eSortDesc;
    private eSortNone;
    private eFilterIcon;
    private eText;
    private column;
    private parentScope;
    private childScope;
    private filterManager;
    private columnController;
    private $compile;
    private grid;
    private headerTemplateLoader;
    private startWidth;
    constructor(column: Column, parentGroup: RenderedHeaderGroupCell, gridOptionsWrapper: GridOptionsWrapper, parentScope: any, filterManager: FilterManager, columnController: ColumnController, $compile: any, angularGrid: Grid, eRoot: HTMLElement, headerTemplateLoader: HeaderTemplateLoader);
    getGui(): HTMLElement;
    destroy(): void;
    private createScope();
    private addAttributes();
    private addMenu();
    private removeSortIcons();
    private addSortIcons();
    private setupComponents();
    private addSort();
    private addResize();
    private useRenderer(headerNameValue, headerCellRenderer);
    refreshFilterIcon(): void;
    refreshSortIcon(): void;
    private getNextSortDirection();
    private addSortHandling();
    onDragStart(): void;
    onDragging(dragChange: number, finished: boolean): void;
    onIndividualColumnResized(column: Column): void;
}
