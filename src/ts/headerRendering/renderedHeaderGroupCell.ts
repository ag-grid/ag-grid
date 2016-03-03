import {Utils as _} from '../utils';
import {Constants as constants} from "../constants";
import {SvgFactory} from "../svgFactory";
import {ColumnGroup} from "../entities/columnGroup";
import {ColumnController} from "../columnController/columnController";
import {FilterManager} from "../filter/filterManager";
import {Grid} from "../grid";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Column} from "../entities/column";
import {HorizontalDragService} from "./horizontalDragService";
import {Autowired} from "../context/context";
import {CssClassApplier} from "./cssClassApplier";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";
import {PostConstruct} from "../context/context";

var svgFactory = SvgFactory.getInstance();

export class RenderedHeaderGroupCell implements IRenderedHeaderElement {

    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('$compile') private $compile: any;
    @Autowired('horizontalDragService') private dragService: HorizontalDragService;
    @Autowired('columnController') private columnController: ColumnController;

    private eHeaderGroupCell: HTMLElement;
    private eHeaderCellResize: HTMLElement;
    private columnGroup: ColumnGroup;

    private groupWidthStart: number;
    private childrenWidthStarts: number[];
    private parentScope: any;
    private destroyFunctions: (()=>void)[] = [];

    private eRoot: HTMLElement;

    constructor(columnGroup:ColumnGroup, eRoot: HTMLElement, parentScope: any) {
        this.columnGroup = columnGroup;
        this.parentScope = parentScope;
        this.eRoot = eRoot;
        this.parentScope = parentScope;
    }

    // required by interface, but we don't use
    public refreshFilterIcon(): void {}
    // required by interface, but we don't use
    public refreshSortIcon(): void {}

    public getGui(): HTMLElement {
        return this.eHeaderGroupCell;
    }

    public onIndividualColumnResized(column: Column) {
        if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
            this.setWidthOfGroupHeaderCell();
        }
    }

    @PostConstruct
    public init(): void {

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
        CssClassApplier.addHeaderClassesFromCollDef(this.columnGroup.getColGroupDef(), this.eHeaderGroupCell, this.gridOptionsWrapper);

        if (this.gridOptionsWrapper.isEnableColResize()) {
            this.eHeaderCellResize = document.createElement("div");
            this.eHeaderCellResize.className = "ag-header-cell-resize";
            this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
            this.dragService.addDragHandling({
                eDraggableElement: this.eHeaderCellResize,
                eBody: this.eRoot,
                cursor: 'col-resize',
                startAfterPixels: 0,
                onDragStart: this.onDragStart.bind(this),
                onDragging: this.onDragging.bind(this)
            });

            if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
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

    private setWidthOfGroupHeaderCell(): void {
        var widthChangedListener = () => {
            this.eHeaderGroupCell.style.width = this.columnGroup.getActualWidth() + 'px';
        };

        this.columnGroup.getLeafColumns().forEach( column => {
            column.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            this.destroyFunctions.push( () => {
                column.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            });
        });

        widthChangedListener();
    }

    public destroy(): void {
        this.destroyFunctions.forEach( (func)=> {
            func();
        });
    }

    private addGroupExpandIcon(eGroupCellLabel: HTMLElement) {
        var eGroupIcon: any;
        if (this.columnGroup.isExpanded()) {
            eGroupIcon = _.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
        } else {
            eGroupIcon = _.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
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
