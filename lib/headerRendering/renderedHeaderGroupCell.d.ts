// Type definitions for ag-grid v3.3.0-alpha.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import RenderedHeaderElement from "./renderedHeaderElement";
import ColumnGroup from "../entities/columnGroup";
import { ColumnController } from "../columnController/columnController";
import FilterManager from "../filter/filterManager";
import { Grid } from "../grid";
import GridOptionsWrapper from "../gridOptionsWrapper";
import Column from "../entities/column";
export default class RenderedHeaderGroupCell extends RenderedHeaderElement {
    private eHeaderGroupCell;
    private eHeaderCellResize;
    private columnGroup;
    private columnController;
    private groupWidthStart;
    private childrenWidthStarts;
    private parentScope;
    private filterManager;
    private $compile;
    private angularGrid;
    constructor(columnGroup: ColumnGroup, gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, eRoot: HTMLElement, angularGrid: Grid, parentScope: any, filterManager: FilterManager, $compile: any);
    getGui(): HTMLElement;
    onIndividualColumnResized(column: Column): void;
    private setupComponents();
    private setWidthOfGroupHeaderCell();
    private addGroupExpandIcon(eGroupCellLabel);
    onDragStart(): void;
    onDragging(dragChange: any, finished: boolean): void;
}
