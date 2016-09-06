import {Utils as _} from "../utils";
import {Column} from "../entities/column";
import {FilterManager} from "../filter/filterManager";
import {ColumnController} from "../columnController/columnController";
import {HeaderTemplateLoader} from "./headerTemplateLoader";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {HorizontalDragService} from "./horizontalDragService";
import {GridCore} from "../gridCore";
import {IMenuFactory} from "../interfaces/iMenuFactory";
import {Autowired, Context, PostConstruct} from "../context/context";
import {CssClassApplier} from "./cssClassApplier";
import {IRenderedHeaderElement} from "./iRenderedHeaderElement";
import {DragAndDropService, DropTarget, DragSource, DragSourceType} from "../dragAndDrop/dragAndDropService";
import {SortController} from "../sortController";
import {SetLeftFeature} from "../rendering/features/setLeftFeature";

export class RenderedHeaderCell implements IRenderedHeaderElement {

    @Autowired('context') private context: Context;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('$compile') private $compile: any;
    @Autowired('gridCore') private gridCore: GridCore;
    @Autowired('headerTemplateLoader') private headerTemplateLoader: HeaderTemplateLoader;
    @Autowired('horizontalDragService') private horizontalDragService: HorizontalDragService;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('$scope') private $scope: any;

    private eHeaderCell: HTMLElement;
    private eRoot: HTMLElement;

    private column: Column;
    private childScope: any;

    private startWidth: number;
    private dragSourceDropTarget: DropTarget;

    private displayName: string;

    // for better structured code, anything we need to do when this column gets destroyed,
    // we put a function in here. otherwise we would have a big destroy function with lots
    // of 'if / else' mapping to things that got created.
    private destroyFunctions: (()=>void)[] = [];

    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget) {
        this.column = column;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
    }

    public getColumn(): Column {
        return this.column;
    }
    
    @PostConstruct
    public init(): void {
        this.eHeaderCell = this.headerTemplateLoader.createHeaderElement(this.column);
        _.addCssClass(this.eHeaderCell, 'ag-header-cell');

        this.createScope();
        this.addAttributes();
        CssClassApplier.addHeaderClassesFromCollDef(this.column.getColDef(), this.eHeaderCell, this.gridOptionsWrapper);

        // label div
        var eHeaderCellLabel = <HTMLElement> this.eHeaderCell.querySelector('#agHeaderCellLabel');

        this.displayName = this.columnController.getDisplayNameForCol(this.column, true);

        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMove(eHeaderCellLabel);
        this.setupMenu();
        this.setupSort(eHeaderCellLabel);
        this.setupFilterIcon();
        this.setupText();
        this.setupWidth();

        var setLeftFeature = new SetLeftFeature(this.column, this.eHeaderCell);
        this.destroyFunctions.push(setLeftFeature.destroy.bind(setLeftFeature));
    }

    private setupTooltip(): void {
        var colDef = this.column.getColDef();

        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.eHeaderCell.title = colDef.headerTooltip;
        }
    }

    private setupText(): void {
        var colDef = this.column.getColDef();
        // render the cell, use a renderer if one is provided
        var headerCellRenderer: any;
        if (colDef.headerCellRenderer) { // first look for a renderer in col def
            headerCellRenderer = colDef.headerCellRenderer;
        } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
            headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
        }

        var eText = <HTMLElement> this.eHeaderCell.querySelector('#agText');
        if (eText) {
            if (headerCellRenderer) {
                this.useRenderer(this.displayName, headerCellRenderer, eText);
            } else {
                // no renderer, default text render
                eText.className = 'ag-header-cell-text';
                eText.innerHTML = this.displayName;
            }
        }
    }

    private setupFilterIcon(): void {
        var eFilterIcon = <HTMLElement> this.eHeaderCell.querySelector('#agFilter');

        if (!eFilterIcon) {
            return;
        }

        var filterChangedListener = () => {
            var filterPresent = this.column.isFilterActive();
            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-filtered', filterPresent);
            _.addOrRemoveCssClass(eFilterIcon, 'ag-hidden', !filterPresent);
        };

        this.column.addEventListener(Column.EVENT_FILTER_ACTIVE_CHANGED, filterChangedListener);
        this.destroyFunctions.push( () => {
            this.column.removeEventListener(Column.EVENT_FILTER_ACTIVE_CHANGED, filterChangedListener);
        });

        filterChangedListener();
    }

    private setupWidth(): void {
        var widthChangedListener = () => {
            this.eHeaderCell.style.width = this.column.getActualWidth() + 'px';
        };

        this.column.addEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.destroyFunctions.push( () => {
            this.column.removeEventListener(Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });

        widthChangedListener();
    }

    public getGui(): HTMLElement {
        return this.eHeaderCell;
    }

    public destroy(): void {
        this.destroyFunctions.forEach( (func)=> {
            func();
        });
    }

    private createScope(): void {
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            this.childScope = this.$scope.$new();
            this.childScope.colDef = this.column.getColDef();
            this.childScope.colDefWrapper = this.column;
            this.childScope.context = this.gridOptionsWrapper.getContext();

            this.destroyFunctions.push( ()=> {
                this.childScope.$destroy();
            });
        }
    }

    private addAttributes(): void {
        this.eHeaderCell.setAttribute("colId", this.column.getColId());
    }

    private setupMenu(): void {
        var eMenu = <HTMLElement> this.eHeaderCell.querySelector('#agMenu');

        // if no menu provided in template, do nothing
        if (!eMenu) {
            return;
        }

        var skipMenu = !this.menuFactory.isMenuEnabled(this.column) || this.column.getColDef().suppressMenu;

        if (skipMenu) {
            _.removeFromParent(eMenu);
            return;
        }

        eMenu.addEventListener('click', ()=> this.showMenu(eMenu));

        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
            eMenu.style.opacity = '0';
            this.eHeaderCell.addEventListener('mouseover', function () {
                eMenu.style.opacity = '1';
            });
            this.eHeaderCell.addEventListener('mouseout', function () {
                eMenu.style.opacity = '0';
            });
        }
        var style = <any> eMenu.style;
        style['transition'] = 'opacity 0.2s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
    }

    public showMenu(eventSource: HTMLElement) {
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource);
    }

    private setupMovingCss(): void {
        // this function adds or removes the moving css, based on if the col is moving
        var addMovingCssFunc = ()=> {
            if (this.column.isMoving()) {
                _.addCssClass(this.eHeaderCell, 'ag-header-cell-moving');
            } else {
                _.removeCssClass(this.eHeaderCell, 'ag-header-cell-moving');
            }
        };
        // call it now once, so the col is set up correctly
        addMovingCssFunc();
        // then call it every time we are informed of a moving state change in the col
        this.column.addEventListener(Column.EVENT_MOVING_CHANGED, addMovingCssFunc);
        // finally we remove the listener when this cell is no longer rendered
        this.destroyFunctions.push(()=> {
            this.column.removeEventListener(Column.EVENT_MOVING_CHANGED, addMovingCssFunc);
        });
    }

    private setupMove(eHeaderCellLabel: HTMLElement): void {
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
                            || this.column.getColDef().suppressMovable
                            || this.gridOptionsWrapper.isForPrint();
                            // || this.columnController.isPivotMode();

        if (suppressMove) { return; }

        if (eHeaderCellLabel) {
            var dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                dragItem: [this.column],
                dragItemName: this.displayName,
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource);
        }
    }

    private setupResize(): void {
        var colDef = this.column.getColDef();
        var eResize = this.eHeaderCell.querySelector('#agResizeBar');

        // if no eResize in template, do nothing
        if (!eResize) {
            return;
        }

        var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
        if (!weWantResize) {
            _.removeFromParent(eResize);
            return;
        }

        this.horizontalDragService.addDragHandling({
            eDraggableElement: eResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });

        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            eResize.addEventListener('dblclick', () => {
                this.columnController.autoSizeColumn(this.column);
            });
        }
    }

    private useRenderer(headerNameValue: string, headerCellRenderer: Function, eText: HTMLElement): void {
        // renderer provided, use it
        var cellRendererParams = {
            colDef: this.column.getColDef(),
            $scope: this.childScope,
            context: this.gridOptionsWrapper.getContext(),
            value: headerNameValue,
            api: this.gridOptionsWrapper.getApi(),
            eHeaderCell: this.eHeaderCell
        };
        var cellRendererResult = headerCellRenderer(cellRendererParams);
        var childToAppend: any;
        if (_.isNodeOrElement(cellRendererResult)) {
            // a dom node or element was returned, so add child
            childToAppend = cellRendererResult;
        } else {
            // otherwise assume it was html, so just insert
            var eTextSpan = document.createElement("span");
            eTextSpan.innerHTML = cellRendererResult;
            childToAppend = eTextSpan;
        }
        // angular compile header if option is turned on
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
            eText.appendChild(childToAppendCompiled);
        } else {
            eText.appendChild(childToAppend);
        }
    }

    public setupSort(eHeaderCellLabel: HTMLElement): void {
        var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
        if (!enableSorting) {
            _.removeFromParent(this.eHeaderCell.querySelector('#agSortAsc'));
            _.removeFromParent(this.eHeaderCell.querySelector('#agSortDesc'));
            _.removeFromParent(this.eHeaderCell.querySelector('#agNoSort'));
            return;
        }

        // add sortable class for styling
        _.addCssClass(this.eHeaderCell, 'ag-header-cell-sortable');

        // add the event on the header, so when clicked, we do sorting
        if (eHeaderCellLabel) {
            eHeaderCellLabel.addEventListener("click", (event:MouseEvent) => {
                this.sortController.progressSort(this.column, event.shiftKey);
            });
        }

        // add listener for sort changing, and update the icons accordingly
        var eSortAsc = <HTMLElement> this.eHeaderCell.querySelector('#agSortAsc');
        var eSortDesc = <HTMLElement> this.eHeaderCell.querySelector('#agSortDesc');
        var eSortNone = <HTMLElement> this.eHeaderCell.querySelector('#agNoSort');

        var sortChangedListener = () => {

            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-asc', this.column.isSortAscending());
            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-desc', this.column.isSortDescending());
            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-none', this.column.isSortNone());

            if (eSortAsc) {
                _.addOrRemoveCssClass(eSortAsc, 'ag-hidden', !this.column.isSortAscending());
            }

            if (eSortDesc) {
                _.addOrRemoveCssClass(eSortDesc, 'ag-hidden', !this.column.isSortDescending());
            }

            if (eSortNone) {
                var alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
                _.addOrRemoveCssClass(eSortNone, 'ag-hidden', alwaysHideNoSort || !this.column.isSortNone());
            }

        };

        this.column.addEventListener(Column.EVENT_SORT_CHANGED, sortChangedListener);
        this.destroyFunctions.push( () => {
            this.column.removeEventListener(Column.EVENT_SORT_CHANGED, sortChangedListener);
        });

        sortChangedListener();
    }

    public onDragStart(): void {
        this.startWidth = this.column.getActualWidth();
    }

    public onDragging(dragChange: number, finished: boolean): void {
        var newWidth = this.startWidth + dragChange;
        this.columnController.setColumnWidth(this.column, newWidth, finished);
    }

    public onIndividualColumnResized(column: Column) {
        if (this.column !== column) {
            return;
        }
        var newWidthPx = column.getActualWidth() + "px";
        this.eHeaderCell.style.width = newWidthPx;
    }


}
