import {Utils as _} from "../../utils";
import {Column} from "../../entities/column";
import {FilterManager} from "../../filter/filterManager";
import {ColumnController} from "../../columnController/columnController";
import {HeaderTemplateLoader} from "./headerTemplateLoader";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {HorizontalDragService} from "../horizontalDragService";
import {GridCore} from "../../gridCore";
import {IMenuFactory} from "../../interfaces/iMenuFactory";
import {Autowired, Context, PostConstruct} from "../../context/context";
import {CssClassApplier} from "../cssClassApplier";
import {DragAndDropService, DropTarget, DragSource, DragSourceType} from "../../dragAndDrop/dragAndDropService";
import {SortController} from "../../sortController";
import {SetLeftFeature} from "../../rendering/features/setLeftFeature";
import {TouchListener} from "../../widgets/touchListener";
import {Component} from "../../widgets/component";

export class RenderedHeaderCell extends Component {

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

    private eRoot: HTMLElement;

    private column: Column;
    private childScope: any;

    private startWidth: number;
    private dragSourceDropTarget: DropTarget;

    private displayName: string;

    private eFilterIcon: HTMLElement;

    private eSortAsc: HTMLElement;
    private eSortDesc: HTMLElement;
    private eSortNone: HTMLElement;

    private pinned: string;

    constructor(column: Column, eRoot: HTMLElement, dragSourceDropTarget: DropTarget, pinned: string) {
        super();
        this.column = column;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
        this.pinned = pinned;
    }

    public getColumn(): Column {
        return this.column;
    }
    
    @PostConstruct
    public init(): void {
        let eGui = this.headerTemplateLoader.createHeaderElement(this.column);
        this.setGui(eGui);
        _.addCssClass(eGui, 'ag-header-cell');

        this.createScope();
        this.addAttributes();
        CssClassApplier.addHeaderClassesFromColDef(this.column.getColDef(), eGui, this.gridOptionsWrapper, this.column, null);

        // label div
        var eHeaderCellLabel = <HTMLElement> eGui.querySelector('#agHeaderCellLabel');

        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);

        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupTap();
        this.setupMove(eHeaderCellLabel);
        this.setupMenu();
        this.setupSort(eHeaderCellLabel);
        this.setupFilterIcon();
        this.setupText();
        this.setupWidth();

        this.addFeature(this.context, new SetLeftFeature(this.column, eGui));
    }

    private setupTooltip(): void {
        var colDef = this.column.getColDef();

        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.getGui().title = colDef.headerTooltip;
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

        var eText = this.queryForHtmlElement('#agText');
        if (eText) {
            if (headerCellRenderer) {
                this.useRenderer(this.displayName, headerCellRenderer, eText);
            } else {
                // no renderer, default text render
                eText.innerHTML = this.displayName;
                // i don't remember why this is here, take it out???
                _.addCssClass(eText, 'ag-header-cell-text');
            }
        }
    }

    private setupFilterIcon(): void {
        this.eFilterIcon = this.queryForHtmlElement('#agFilter');

        if (!this.eFilterIcon) {
            return;
        }

        this.addDestroyableEventListener(this.column, Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));

        this.onFilterChanged();
    }

    private onFilterChanged(): void {
        var filterPresent = this.column.isFilterActive();
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
        _.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !filterPresent);
    }

    private setupWidth(): void {
        this.addDestroyableEventListener(this.column, Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    }

    private onColumnWidthChanged(): void {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    }

    private createScope(): void {
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            this.childScope = this.$scope.$new();
            this.childScope.colDef = this.column.getColDef();
            this.childScope.colDefWrapper = this.column;
            this.childScope.context = this.gridOptionsWrapper.getContext();

            this.addDestroyFunc( ()=> {
                this.childScope.$destroy();
            });
        }
    }

    private addAttributes(): void {
        this.getGui().setAttribute("colId", this.column.getColId());
    }

    private setupMenu(): void {
        var eMenu = this.queryForHtmlElement('#agMenu');

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
            this.addGuiEventListener('mouseover', function () {
                eMenu.style.opacity = '1';
            });
            this.addGuiEventListener('mouseout', function () {
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
        this.addDestroyableEventListener(this.column, Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    }

    private onColumnMovingChanged(): void {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.column.isMoving()) {
            _.addCssClass(this.getGui(), 'ag-header-cell-moving');
        } else {
            _.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    }

    private setupMove(eHeaderCellLabel: HTMLElement): void {
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
                            || this.column.getColDef().suppressMovable
                            || this.gridOptionsWrapper.isForPrint();

        if (suppressMove) { return; }

        if (eHeaderCellLabel) {
            var dragSource: DragSource = {
                type: DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                dragItem: [this.column],
                dragItemName: this.displayName,
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc( ()=> this.dragAndDropService.removeDragSource(dragSource) );
        }
    }

    private setupTap(): void {

        if (this.gridOptionsWrapper.isSuppressTouch()) { return; }

        let touchListener = new TouchListener(this.getGui());
        let tapListener = ()=> {
            this.sortController.progressSort(this.column, false);
        };
        let longTapListener = (touch: Touch)=> {
            this.gridOptionsWrapper.getApi().showColumnMenuAfterMouseClick(this.column, touch);
        };

        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, tapListener);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_LONG_TAP, longTapListener);

        this.addDestroyFunc( ()=> touchListener.destroy() );
    }

    private setupResize(): void {
        var colDef = this.column.getColDef();
        var eResize = this.queryForHtmlElement('#agResizeBar');

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
            this.addDestroyableEventListener(eResize, 'dblclick', () => {
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
            eHeaderCell: this.getGui()
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
        let eGui = this.getGui();
        if (!enableSorting) {
            _.removeFromParent(eGui.querySelector('#agSortAsc'));
            _.removeFromParent(eGui.querySelector('#agSortDesc'));
            _.removeFromParent(eGui.querySelector('#agNoSort'));
            return;
        }

        // add sortable class for styling
        _.addCssClass(eGui, 'ag-header-cell-sortable');

        // add the event on the header, so when clicked, we do sorting
        if (eHeaderCellLabel) {
            eHeaderCellLabel.addEventListener("click", (event:MouseEvent) => {
                this.sortController.progressSort(this.column, event.shiftKey);
            });
        }

        // add listener for sort changing, and update the icons accordingly
        this.eSortAsc = this.queryForHtmlElement('#agSortAsc');
        this.eSortDesc = this.queryForHtmlElement('#agSortDesc');
        this.eSortNone = this.queryForHtmlElement('#agNoSort');

        this.addDestroyableEventListener(this.column, Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
    }

    private onSortChanged(): void {

        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-asc', this.column.isSortAscending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-desc', this.column.isSortDescending());
        _.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-none', this.column.isSortNone());

        if (this.eSortAsc) {
            _.addOrRemoveCssClass(this.eSortAsc, 'ag-hidden', !this.column.isSortAscending());
        }

        if (this.eSortDesc) {
            _.addOrRemoveCssClass(this.eSortDesc, 'ag-hidden', !this.column.isSortDescending());
        }

        if (this.eSortNone) {
            var alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            _.addOrRemoveCssClass(this.eSortNone, 'ag-hidden', alwaysHideNoSort || !this.column.isSortNone());
        }
    }

    public onDragStart(): void {
        this.startWidth = this.column.getActualWidth();
    }

    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    private normaliseDragChange(dragChange: number): number {
        let result = dragChange;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== Column.PINNED_LEFT) {
                result *= -1;
            }
        } else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (this.pinned === Column.PINNED_RIGHT) {
                result *= -1;
            }
        }
        return result;
    }

    public onDragging(dragChange: number, finished: boolean): void {
        let dragChangeNormalised = this.normaliseDragChange(dragChange);
        let newWidth = this.startWidth + dragChangeNormalised;
        this.columnController.setColumnWidth(this.column, newWidth, finished);
    }

}
