/// <reference path='../utils.ts' />
/// <reference path='renderedHeaderCell.ts' />
/// <reference path='renderedHeaderElement.ts' />

module ag.grid {

    var _ = Utils;
    var constants = Constants;
    var svgFactory = SvgFactory.getInstance();

    export class RenderedHeaderGroupCell extends RenderedHeaderElement {

        private eHeaderGroup: HTMLElement;
        private eHeaderGroupCell: HTMLElement;
        private eHeaderCellResize: HTMLElement;
        private columnGroup: ColumnGroup;
        private gridOptionsWrapper: GridOptionsWrapper;
        private columnController: ColumnController;

        private children: RenderedHeaderCell[] = [];

        private groupWidthStart: number;
        private childrenWidthStarts: number[];
        private minWidth: number;
        private parentScope: any;
        private filterManager: FilterManager;
        private $compile: any;
        private angularGrid: Grid;

        constructor(columnGroup:ColumnGroup, gridOptionsWrapper:GridOptionsWrapper,
                    columnController: ColumnController, eRoot: HTMLElement, angularGrid: Grid,
                    parentScope: any, filterManager: FilterManager, $compile: any) {
            super(eRoot);
            this.columnController = columnController;
            this.columnGroup = columnGroup;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.parentScope = parentScope;
            this.filterManager = filterManager;
            this.$compile = $compile;
            this.angularGrid = angularGrid;
            this.setupComponents();
        }

        public getGui(): HTMLElement {
            return this.eHeaderGroup;
        }

        public destroy(): void {
            this.children.forEach( (childElement: RenderedHeaderElement)=> {
                childElement.destroy();
            });
        }

        public refreshFilterIcon(): void {
            this.children.forEach( (childElement: RenderedHeaderElement)=> {
                childElement.refreshFilterIcon();
            });
        }

        public refreshSortIcon(): void {
            this.children.forEach( (childElement: RenderedHeaderElement)=> {
                childElement.refreshSortIcon();
            });
        }

        public onIndividualColumnResized(column: Column) {
            if (!this.isColumnInOurDisplayedGroup(column)) {
                return;
            }
            this.children.forEach( (childElement: RenderedHeaderElement)=> {
                childElement.onIndividualColumnResized(column);
            });
            this.setWidthOfGroupHeaderCell();
        }

        private setupComponents() {
            this.eHeaderGroup = document.createElement('div');
            this.eHeaderGroup.className = 'ag-header-group';

            this.eHeaderGroupCell = document.createElement('div');
            var classNames = ['ag-header-group-cell'];
            // having different classes below allows the style to not have a bottom border
            // on the group header, if no group is specified
            if (this.columnGroup.name) {
                classNames.push('ag-header-group-cell-with-group');
            } else {
                classNames.push('ag-header-group-cell-no-group');
            }
            this.eHeaderGroupCell.className = classNames.join(' ');

            if (this.gridOptionsWrapper.isEnableColResize()) {
                this.eHeaderCellResize = document.createElement("div");
                this.eHeaderCellResize.className = "ag-header-cell-resize";
                this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
                this.addDragHandler(this.eHeaderCellResize);
            }

            // no renderer, default text render
            var groupName = this.columnGroup.name;
            if (groupName && groupName !== '') {
                var eGroupCellLabel = document.createElement("div");
                eGroupCellLabel.className = 'ag-header-group-cell-label';
                this.eHeaderGroupCell.appendChild(eGroupCellLabel);

                var eInnerText = document.createElement("span");
                eInnerText.className = 'ag-header-group-text';
                eInnerText.innerHTML = groupName;
                eGroupCellLabel.appendChild(eInnerText);

                if (this.columnGroup.expandable) {
                    this.addGroupExpandIcon(eGroupCellLabel);
                }
            }
            this.eHeaderGroup.appendChild(this.eHeaderGroupCell);

            this.columnGroup.displayedColumns.forEach( (column: Column) => {
                var renderedHeaderCell = new RenderedHeaderCell(column, this, this.gridOptionsWrapper,
                    this.parentScope, this.filterManager, this.columnController, this.$compile,
                    this.angularGrid, this.getERoot());
                this.children.push(renderedHeaderCell);
                this.eHeaderGroup.appendChild(renderedHeaderCell.getGui());
            });

            this.setWidthOfGroupHeaderCell();
        }

        private isColumnInOurDisplayedGroup(column: Column): boolean {
            return this.columnGroup.displayedColumns.indexOf(column) >= 0;
        }

        private setWidthOfGroupHeaderCell() {
            this.eHeaderGroupCell.style.width = _.formatWidth(this.columnGroup.actualWidth);
        }

        private addGroupExpandIcon(eGroupCellLabel: HTMLElement) {
            var eGroupIcon: any;
            if (this.columnGroup.expanded) {
                eGroupIcon = _.createIcon('headerGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
            } else {
                eGroupIcon = _.createIcon('headerGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
            }
            eGroupIcon.className = 'ag-header-expand-icon';
            eGroupCellLabel.appendChild(eGroupIcon);

            var that = this;
            eGroupIcon.onclick = function() {
                var newExpandedValue = !that.columnGroup.expanded;
                that.columnController.columnGroupOpened(that.columnGroup, newExpandedValue);
            };
        }

        public onDragStart(): void {
            this.groupWidthStart = this.columnGroup.actualWidth;
            this.childrenWidthStarts = [];
            this.columnGroup.displayedColumns.forEach( (column: Column) => {
                this.childrenWidthStarts.push(column.actualWidth);
            });
            this.minWidth = this.columnGroup.getMinimumWidth();
        }

        public onDragging(dragChange: any, finished: boolean): void {

            var newWidth = this.groupWidthStart + dragChange;
            if (newWidth < this.minWidth) {
                newWidth = this.minWidth;
            }

            // set the new width to the group header
            //var newWidthPx = newWidth + "px";
            //this.eHeaderGroupCell.style.width = newWidthPx;
            //this.columnGroup.actualWidth = newWidth;

            // distribute the new width to the child headers
            var changeRatio = newWidth / this.groupWidthStart;
            // keep track of pixels used, and last column gets the remaining,
            // to cater for rounding errors, and min width adjustments
            var pixelsToDistribute = newWidth;
            var displayedColumns = this.columnGroup.displayedColumns;
            displayedColumns.forEach( (column: Column, index: any) => {
                var notLastCol = index !== (displayedColumns.length - 1);
                var newChildSize: any;
                if (notLastCol) {
                    // if not the last col, calculate the column width as normal
                    var startChildSize = this.childrenWidthStarts[index];
                    newChildSize = startChildSize * changeRatio;
                    if (newChildSize < constants.MIN_COL_WIDTH) {
                        newChildSize = constants.MIN_COL_WIDTH;
                    }
                    pixelsToDistribute -= newChildSize;
                } else {
                    // if last col, give it the remaining pixels
                    newChildSize = pixelsToDistribute;
                }
                this.columnController.setColumnWidth(column, newChildSize, finished);
            });
        }

    }

}
