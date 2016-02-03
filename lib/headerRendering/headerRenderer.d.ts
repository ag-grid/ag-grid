// Type definitions for ag-grid v3.3.0-alpha.1
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
export default class HeaderRenderer {
    private headerTemplateLoader;
    private gridOptionsWrapper;
    private columnController;
    private angularGrid;
    private filterManager;
    private $scope;
    private $compile;
    private ePinnedLeftHeader;
    private ePinnedRightHeader;
    private eHeaderContainer;
    private eHeaderViewport;
    private eRoot;
    private headerElements;
    init(gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, gridPanel: GridPanel, angularGrid: Grid, filterManager: FilterManager, $scope: any, $compile: any, headerTemplateLoader: HeaderTemplateLoader): void;
    private findAllElements(gridPanel);
    refreshHeader(): void;
    private addTreeNodesAtDept(cellTree, dept, result);
    setPinnedColContainerWidth(): void;
    private insertHeaderRowsIntoContainer(cellTree, eContainerToAddTo);
    private createHeaderElement(columnGroupChild);
    updateSortIcons(): void;
    updateFilterIcons(): void;
    onIndividualColumnResized(column: Column): void;
}
