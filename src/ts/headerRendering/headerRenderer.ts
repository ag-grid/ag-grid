/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../headerRendering/renderedHeaderElement.ts" />
/// <reference path="../headerRendering/renderedHeaderCell.ts" />
/// <reference path="../headerRendering/renderedHeaderGroupCell.ts" />

module ag.grid {

    var utils = Utils;

    export class HeaderRenderer {

        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private angularGrid: Grid;
        private filterManager: FilterManager;
        private $scope: any;
        private $compile: any;
        private ePinnedHeader: HTMLElement;
        private eHeaderContainer: HTMLElement;
        private eRoot: HTMLElement;

        private headerElements: RenderedHeaderElement[] = [];

        public init(gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, gridPanel: GridPanel,
                    angularGrid: Grid, filterManager: FilterManager, $scope: any, $compile: any) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnController = columnController;
            this.angularGrid = angularGrid;
            this.filterManager = filterManager;
            this.$scope = $scope;
            this.$compile = $compile;
            this.findAllElements(gridPanel);
        }

        private findAllElements(gridPanel: GridPanel) {
            this.ePinnedHeader = gridPanel.getPinnedHeader();
            this.eHeaderContainer = gridPanel.getHeaderContainer();
            this.eRoot = gridPanel.getRoot();
        }

        public refreshHeader() {
            utils.removeAllChildren(this.ePinnedHeader);
            utils.removeAllChildren(this.eHeaderContainer);

            this.headerElements.forEach( (headerElement: RenderedHeaderElement) => {
                headerElement.destroy();
            });
            this.headerElements = [];

            this.insertHeaderRowsIntoContainer(this.columnController.getLeftHeaderGroups(), this.ePinnedHeader);
            this.insertHeaderRowsIntoContainer(this.columnController.getCenterHeaderGroups(), this.eHeaderContainer);
        }

        private addTreeNodesAtDept(cellTree: AbstractColumn[], dept: number, result: AbstractColumn[]): void {
            cellTree.forEach( (abstractColumn) => {
                if (dept===0) {
                    result.push(abstractColumn);
                } else if (abstractColumn instanceof ColumnGroup) {
                    var columnGroup = <ColumnGroup> abstractColumn;
                    this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept-1, result);
                } else {
                    // we are looking for children past a column, so have come to the end,
                    // do nothing, and because the tree is balanced, the result of this recursion
                    // will be an empty list.
                }
            });
        }

        private insertHeaderRowsIntoContainer(cellTree: AbstractColumn[], eContainerToAddTo: HTMLElement): void {

            // if we are displaying header groups, then we have many rows here.
            // go through each row of the header, one by one.
            for (var dept = 0; ; dept++) {

                var nodesAtDept: AbstractColumn[] = [];
                this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);

                // we want to break the for loop when we get to an empty set of cells,
                // that's how we know we have finished rendering the last row.
                if (nodesAtDept.length===0) {
                    break;
                }

                var eRow: HTMLElement = document.createElement('div');
                eRow.className = 'ag-header-row';
                eRow.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';

                nodesAtDept.forEach( (abstractColumn: AbstractColumn) => {
                    var renderedHeaderElement = this.createHeaderElement(abstractColumn);
                    this.headerElements.push(renderedHeaderElement);
                    eRow.appendChild(renderedHeaderElement.getGui());
                });

                eContainerToAddTo.appendChild(eRow);
            }
        }

        private createHeaderElement(abstractColumn: AbstractColumn): RenderedHeaderElement {
            if (abstractColumn instanceof ColumnGroup) {
                return new RenderedHeaderGroupCell(<ColumnGroup> abstractColumn, this.gridOptionsWrapper,
                    this.columnController, this.eRoot, this.angularGrid, this.$scope,
                    this.filterManager, this.$compile);
            } else {
                return new RenderedHeaderCell(<Column> abstractColumn, null, this.gridOptionsWrapper,
                    this.$scope, this.filterManager, this.columnController, this.$compile,
                    this.angularGrid, this.eRoot);
            }
        }

        //private insertHeadersWithoutGrouping() {
        //    this.putColumnsIntoContainer(this.columnController.getDisplayedLeftColumns(), this.ePinnedHeader);
        //    this.putColumnsIntoContainer(this.columnController.getDisplayedCenterColumns(), this.eHeaderContainer);
        //}

/*        private putColumnsIntoContainer(columns: Column[], eContainerToAddTo: HTMLElement): void {
            columns.forEach( (column: Column) => {
                var renderedHeaderCell = new RenderedHeaderCell(column, null, this.gridOptionsWrapper,
                    this.$scope, this.filterManager, this.columnController, this.$compile,
                    this.angularGrid, this.eRoot);
                this.headerElements.push(renderedHeaderCell);
                eContainerToAddTo.appendChild(renderedHeaderCell.getGui());
            });
        }*/

        public updateSortIcons() {
            this.headerElements.forEach( (headerElement: RenderedHeaderElement) => {
                headerElement.refreshSortIcon();
            });
        }

        public updateFilterIcons() {
            this.headerElements.forEach( (headerElement: RenderedHeaderElement) => {
                headerElement.refreshFilterIcon();
            });
        }

        public onIndividualColumnResized(column: Column): void {
            this.headerElements.forEach( (headerElement: RenderedHeaderElement) => {
                headerElement.onIndividualColumnResized(column);
            });
        }
    }
}
