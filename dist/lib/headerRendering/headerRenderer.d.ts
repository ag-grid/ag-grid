// Type definitions for ag-grid v3.3.3
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ceolter/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped
import HeaderTemplateLoader from "./headerTemplateLoader";
import GridOptionsWrapper from "../gridOptionsWrapper";
import { ColumnController } from "../columnController/columnController";
import { Grid } from "../grid";
import FilterManager from "../filter/filterManager";
import GridPanel from "../gridPanel/gridPanel";
import Column from "../entities/column";
import { DragService } from "./dragService";
export default class HeaderRenderer {
    private headerTemplateLoader;
    private gridOptionsWrapper;
    private columnController;
    private grid;
    private filterManager;
    private $scope;
    private $compile;
    private ePinnedLeftHeader;
    private ePinnedRightHeader;
    private eHeaderContainer;
    private eHeaderViewport;
    private eRoot;
    private dragService;
    private gridPanel;
    private eHeaderOverlay;
    private headerElements;
    init(gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, gridPanel: GridPanel, grid: Grid, filterManager: FilterManager, $scope: any, $compile: any, headerTemplateLoader: HeaderTemplateLoader, dragService: DragService): void;
    private findAllElements();
    refreshHeader(): void;
    addChildToOverlay(child: HTMLElement): void;
    removeChildFromOverlay(child: HTMLElement): void;
    private addTreeNodesAtDept(cellTree, dept, result);
    setPinnedColContainerWidth(): void;
    getRightPinnedStartPixel(): number;
    private insertHeaderRowsIntoContainer(cellTree, eContainerToAddTo);
    private createHeaderElement(columnGroupChild);
    updateSortIcons(): void;
    updateFilterIcons(): void;
    onIndividualColumnResized(column: Column): void;
}
