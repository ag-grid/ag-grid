/// <reference path="../utils.ts" />
/// <reference path="../constants.ts" />
/// <reference path="../svgFactory.ts" />
/// <reference path="../headerRendering/renderedHeaderElement.ts" />
/// <reference path="../headerRendering/renderedHeaderCell.ts" />
/// <reference path="../headerRendering/renderedHeaderGroupCell.ts" />

module ag.grid {

    var utils = Utils;

    export class HeaderRenderer {

        private headerTemplateLoader: HeaderTemplateLoader;
        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;
        private angularGrid: Grid;
        private filterManager: FilterManager;
        private $scope: any;
        private $compile: any;
        private ePinnedLeftHeader: HTMLElement;
        private ePinnedRightHeader: HTMLElement;
        private eHeaderContainer: HTMLElement;
        private eHeaderViewport: HTMLElement;
        private eRoot: HTMLElement;

        private headerElements: RenderedHeaderElement[] = [];

        public init(gridOptionsWrapper: GridOptionsWrapper, columnController: ColumnController, gridPanel: GridPanel,
                    angularGrid: Grid, filterManager: FilterManager, $scope: any, $compile: any,
                    headerTemplateLoader: HeaderTemplateLoader) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnController = columnController;
            this.angularGrid = angularGrid;
            this.filterManager = filterManager;
            this.$scope = $scope;
            this.$compile = $compile;
            this.headerTemplateLoader = headerTemplateLoader;
            this.findAllElements(gridPanel);
        }

        private findAllElements(gridPanel: GridPanel) {
            this.ePinnedLeftHeader = gridPanel.getPinnedLeftHeader();
            this.ePinnedRightHeader = gridPanel.getPinnedRightHeader();
            this.eHeaderContainer = gridPanel.getHeaderContainer();
            this.eHeaderViewport = gridPanel.getHeaderViewport();
            this.eRoot = gridPanel.getRoot();
        }

        public refreshHeader() {
            utils.removeAllChildren(this.ePinnedLeftHeader);
            utils.removeAllChildren(this.ePinnedRightHeader);
            utils.removeAllChildren(this.eHeaderContainer);

            this.headerElements.forEach( (headerElement: RenderedHeaderElement) => {
                headerElement.destroy();
            });
            this.headerElements = [];

            this.insertHeaderRowsIntoContainer(this.columnController.getLeftHeaderGroups(), this.ePinnedLeftHeader);
            this.insertHeaderRowsIntoContainer(this.columnController.getRightHeaderGroups(), this.ePinnedRightHeader);
            this.insertHeaderRowsIntoContainer(this.columnController.getCenterHeaderGroups(), this.eHeaderContainer);
        }

        private addTreeNodesAtDept(cellTree: ColumnGroupChild[], dept: number, result: ColumnGroupChild[]): void {
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

        public setPinnedColContainerWidth() {
            if (this.gridOptionsWrapper.isForPrint()) {
                // pinned col doesn't exist when doing forPrint
                return;
            }

            var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
            this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;

            var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
            this.eHeaderViewport.style.marginRight = pinnedRightWidth;
        }

        private insertHeaderRowsIntoContainer(cellTree: ColumnGroupChild[], eContainerToAddTo: HTMLElement): void {

            // if we are displaying header groups, then we have many rows here.
            // go through each row of the header, one by one.
            for (var dept = 0; ; dept++) {

                var nodesAtDept: ColumnGroupChild[] = [];
                this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);

                // we want to break the for loop when we get to an empty set of cells,
                // that's how we know we have finished rendering the last row.
                if (nodesAtDept.length===0) {
                    break;
                }

                var eRow: HTMLElement = document.createElement('div');
                eRow.className = 'ag-header-row';
                eRow.style.top = (dept * this.gridOptionsWrapper.getHeaderHeight()) + 'px';
                eRow.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';

                nodesAtDept.forEach( (child: ColumnGroupChild) => {
                    var renderedHeaderElement = this.createHeaderElement(child);
                    this.headerElements.push(renderedHeaderElement);
                    eRow.appendChild(renderedHeaderElement.getGui());
                });

                eContainerToAddTo.appendChild(eRow);
            }
        }

        private createHeaderElement(columnGroupChild: ColumnGroupChild): RenderedHeaderElement {
            if (columnGroupChild instanceof ColumnGroup) {
                return new RenderedHeaderGroupCell(<ColumnGroup> columnGroupChild, this.gridOptionsWrapper,
                    this.columnController, this.eRoot, this.angularGrid, this.$scope,
                    this.filterManager, this.$compile);
            } else {
                return new RenderedHeaderCell(<Column> columnGroupChild, null, this.gridOptionsWrapper,
                    this.$scope, this.filterManager, this.columnController, this.$compile,
                    this.angularGrid, this.eRoot, this.headerTemplateLoader);
            }
        }

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
