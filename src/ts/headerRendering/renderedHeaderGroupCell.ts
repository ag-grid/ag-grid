import _ from '../utils';
import constants from "../constants";
import SvgFactory from "../svgFactory";
import RenderedHeaderElement from "./renderedHeaderElement";
import ColumnGroup from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";
import FilterManager from "../filter/filterManager";
import {Grid} from "../grid";
import GridOptionsWrapper from "../gridOptionsWrapper";
import Column from "../entities/column";
import {DragService} from "./dragService";

var svgFactory = SvgFactory.getInstance();

export default class RenderedHeaderGroupCell extends RenderedHeaderElement {

    private eHeaderGroupCell: HTMLElement;
    private eHeaderCellResize: HTMLElement;
    private columnGroup: ColumnGroup;
    private columnController: ColumnController;

    private groupWidthStart: number;
    private childrenWidthStarts: number[];
    private parentScope: any;
    private filterManager: FilterManager;
    private $compile: any;

    constructor(columnGroup:ColumnGroup, gridOptionsWrapper:GridOptionsWrapper,
                columnController: ColumnController, eRoot: HTMLElement,
                parentScope: any, filterManager: FilterManager, $compile: any,
                dragService: DragService) {
        super(gridOptionsWrapper);
        this.columnController = columnController;
        this.columnGroup = columnGroup;
        this.parentScope = parentScope;
        this.filterManager = filterManager;
        this.$compile = $compile;
        this.setupComponents(eRoot, dragService);
    }

    public getGui(): HTMLElement {
        return this.eHeaderGroupCell;
    }

    public onIndividualColumnResized(column: Column) {
        if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
            this.setWidthOfGroupHeaderCell();
        }
    }

    private setupComponents(eRoot: HTMLElement, dragService: DragService) {

        this.eHeaderGroupCell = document.createElement('div');
        var classNames = ['ag-header-group-cell'];
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.columnGroup.getColGroupDef()) {
            classNames.push('ag-header-group-cell-with-group');
        } else {
            classNames.push('ag-header-group-cell-no-group');
        }
        this.eHeaderGroupCell.className = classNames.join(' ');
        //this.eHeaderGroupCell.style.height = this.getGridOptionsWrapper().getHeaderHeight() + 'px';
        this.addHeaderClassesFromCollDef(this.columnGroup.getColGroupDef(), this.eHeaderGroupCell);

        if (this.getGridOptionsWrapper().isEnableColResize()) {
            this.eHeaderCellResize = document.createElement("div");
            this.eHeaderCellResize.className = "ag-header-cell-resize";
            this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
            dragService.addDragHandling({
                eDraggableElement: this.eHeaderCellResize,
                eBody: eRoot,
                cursor: 'col-resize',
                startAfterPixels: 0,
                onDragStart: this.onDragStart.bind(this),
                onDragging: this.onDragging.bind(this)
            });

            if (!this.getGridOptionsWrapper().isSuppressAutoSize()) {
                this.eHeaderCellResize.addEventListener('dblclick', (event:MouseEvent) => {
                    // get list of all the column keys we are responsible for
                    var keys: string[] = [];
                    this.columnGroup.getDisplayedLeafColumns().forEach( (column: Column)=>{
                        // not all cols in the group may be participating with auto-resize
                        if (!column.getColDef().suppressAutoSize) {
                            keys.push(column.getColId());
                        }
                    });
                    if (keys.length>0) {
                        this.columnController.autoSizeColumns(keys);
                    }
                });
            }
        }

        // no renderer, default text render
        var groupName = this.columnGroup.getHeaderName();
        if (groupName && groupName !== '') {
            var eGroupCellLabel = document.createElement("div");
            eGroupCellLabel.className = 'ag-header-group-cell-label';
            this.eHeaderGroupCell.appendChild(eGroupCellLabel);

            if (_.isBrowserSafari()) {
                eGroupCellLabel.style.display = 'table-cell';
            }

            var eInnerText = document.createElement("span");
            eInnerText.className = 'ag-header-group-text';
            eInnerText.innerHTML = groupName;
            eGroupCellLabel.appendChild(eInnerText);

            if (this.columnGroup.isExpandable()) {
                this.addGroupExpandIcon(eGroupCellLabel);
            }
        }

        this.setWidthOfGroupHeaderCell();
    }

    private setWidthOfGroupHeaderCell() {
        this.eHeaderGroupCell.style.width = _.formatWidth(this.columnGroup.getActualWidth());
    }

    private addGroupExpandIcon(eGroupCellLabel: HTMLElement) {
        var eGroupIcon: any;
        if (this.columnGroup.isExpanded()) {
            eGroupIcon = _.createIcon('columnGroupOpened', this.getGridOptionsWrapper(), null, svgFactory.createArrowLeftSvg);
        } else {
            eGroupIcon = _.createIcon('columnGroupClosed', this.getGridOptionsWrapper(), null, svgFactory.createArrowRightSvg);
        }
        eGroupIcon.className = 'ag-header-expand-icon';
        eGroupCellLabel.appendChild(eGroupIcon);

        var that = this;
        eGroupIcon.onclick = function() {
            var newExpandedValue = !that.columnGroup.isExpanded();
            that.columnController.setColumnGroupOpened(that.columnGroup, newExpandedValue);
        };
    }

    public onDragStart(): void {
        this.groupWidthStart = this.columnGroup.getActualWidth();
        this.childrenWidthStarts = [];
        this.columnGroup.getDisplayedLeafColumns().forEach( (column: Column) => {
            this.childrenWidthStarts.push(column.getActualWidth());
        });
    }

    public onDragging(dragChange: any, finished: boolean): void {

        var newWidth = this.groupWidthStart + dragChange;
        var minWidth = this.columnGroup.getMinWidth();
        if (newWidth < minWidth) {
            newWidth = minWidth;
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
        var displayedColumns = this.columnGroup.getDisplayedLeafColumns();
        displayedColumns.forEach( (column: Column, index: any) => {
            var notLastCol = index !== (displayedColumns.length - 1);
            var newChildSize: any;
            if (notLastCol) {
                // if not the last col, calculate the column width as normal
                var startChildSize = this.childrenWidthStarts[index];
                newChildSize = startChildSize * changeRatio;
                if (newChildSize < column.getMinWidth()) {
                    newChildSize = column.getMinWidth();
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
