import {_} from "../utils";
import {CellComp} from "./cellComp";
import {CellChangedEvent, DataChangedEvent, RowNode} from "../entities/rowNode";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {Column} from "../entities/column";
import {
    Events,
    RowClickedEvent,
    RowDoubleClickedEvent,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowEvent,
    RowValueChangedEvent,
    VirtualRowRemovedEvent
} from "../events";
import {Autowired} from "../context/context";
import {ICellRendererComp, ICellRendererParams} from "./cellRenderers/iCellRenderer";
import {RowContainerComponent} from "./rowContainerComponent";
import {Component} from "../widgets/component";
import {RefSelector} from "../widgets/componentAnnotations";
import {Beans} from "./beans";
import {ProcessRowParams} from "../entities/gridOptions";

export class LoadingCellRenderer extends Component {

    private static TEMPLATE =
        `<div class="ag-stub-cell">
            <span class="ag-loading-icon" ref="eLoadingIcon"></span>
            <span class="ag-loading-text" ref="eLoadingText"></span>
        </div>`;

    @Autowired('gridOptionsWrapper') gridOptionsWrapper: GridOptionsWrapper;

    @RefSelector('eLoadingIcon') private eLoadingIcon: HTMLElement;
    @RefSelector('eLoadingText') private eLoadingText: HTMLElement;

    constructor() {
        super(LoadingCellRenderer.TEMPLATE);
    }

    public init(params: ICellRendererParams): void {
        let eLoadingIcon = _.createIconNoSpan('groupLoading', this.gridOptionsWrapper, null);
        this.eLoadingIcon.appendChild(eLoadingIcon);

        let localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.eLoadingText.innerText = localeTextFunc('loadingOoo', 'Loading');
    }

    public refresh(params: any): boolean {
        return false;
    }
}

export class RowComp extends Component {

    public static DOM_DATA_KEY_RENDERED_ROW = 'renderedRow';

    private static FULL_WIDTH_CELL_RENDERER = 'fullWidthCellRenderer';

    private static GROUP_ROW_RENDERER = 'groupRowRenderer';
    private static GROUP_ROW_RENDERER_COMP_NAME = 'agGroupRowRenderer';

    private static LOADING_CELL_RENDERER = 'loadingCellRenderer';
    private static LOADING_CELL_RENDERER_COMP_NAME = 'agLoadingCellRenderer';

    private static DETAIL_CELL_RENDERER = 'detailCellRenderer';
    private static DETAIL_CELL_RENDERER_COMP_NAME = 'agDetailCellRenderer';

    private rowNode: RowNode;

    private beans: Beans;

    private ePinnedLeftRow: HTMLElement;
    private ePinnedRightRow: HTMLElement;
    private eBodyRow: HTMLElement;
    private eAllRowContainers: HTMLElement[] = [];

    private eFullWidthRow: HTMLElement;
    private eFullWidthRowBody: HTMLElement;
    private eFullWidthRowLeft: HTMLElement;
    private eFullWidthRowRight: HTMLElement;

    private bodyContainerComp: RowContainerComponent;
    private fullWidthContainerComp: RowContainerComponent;
    private pinnedLeftContainerComp: RowContainerComponent;
    private pinnedRightContainerComp: RowContainerComponent;

    private fullWidthRowComponent: ICellRendererComp;
    private fullWidthRowComponentBody: ICellRendererComp;
    private fullWidthRowComponentLeft: ICellRendererComp;
    private fullWidthRowComponentRight: ICellRendererComp;

    private active = true;

    private fullWidthRow: boolean;
    private fullWidthRowEmbedded: boolean;

    private editingRow: boolean;
    private rowFocused: boolean;

    private columnRefreshPending = false;

    private cellComps: {[key: string]: CellComp} = {};

    // for animations, there are bits we want done in the next VM turn, to all DOM to update first.
    // instead of each row doing a setTimeout(func,0), we put the functions here and the rowRenderer
    // executes them all in one timeout
    private createSecondPassFuncs: Function[] = [];

    // these get called before the row is destroyed - they set up the DOM for the remove animation (ie they
    // set the DOM up for the animation), then the delayedDestroyFunctions get called when the animation is
    // complete (ie removes from the dom).
    private removeFirstPassFuncs: Function[] = [];

    // for animations, these functions get called 400ms after the row is cleared, called by the rowRenderer
    // so each row isn't setting up it's own timeout
    private removeSecondPassFuncs: Function[] = [];

    private fadeRowIn: boolean;
    private slideRowIn: boolean;
    private useAnimationFrameForCreate: boolean;

    private rowIsEven: boolean;

    private paginationPage: number;

    private parentScope: any;
    private scope: any;

    private initialised = false;

    constructor(parentScope: any,
                bodyContainerComp: RowContainerComponent,
                pinnedLeftContainerComp: RowContainerComponent,
                pinnedRightContainerComp: RowContainerComponent,
                fullWidthContainerComp: RowContainerComponent,
                rowNode: RowNode,
                beans: Beans,
                animateIn: boolean,
                useAnimationFrameForCreate: boolean) {
        super();
        this.parentScope = parentScope;
        this.beans = beans;
        this.bodyContainerComp = bodyContainerComp;
        this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        this.pinnedRightContainerComp = pinnedRightContainerComp;
        this.fullWidthContainerComp = fullWidthContainerComp;
        this.rowNode = rowNode;
        this.rowIsEven = this.rowNode.rowIndex % 2 === 0;
        this.paginationPage = this.beans.paginationProxy.getCurrentPage();
        this.useAnimationFrameForCreate = useAnimationFrameForCreate;

        this.setAnimateFlags(animateIn);
    }

    public init(): void {
        this.rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);

        this.scope = this.createChildScopeOrNull(this.rowNode.data);

        this.setupRowContainers();

        this.addListeners();

        if (this.slideRowIn) {
            this.createSecondPassFuncs.push( () => {
                this.onTopChanged();
            });
        }
        if (this.fadeRowIn) {
            this.createSecondPassFuncs.push( () => {
                this.eAllRowContainers.forEach(eRow => _.removeCssClass(eRow, 'ag-opacity-zero'));
            });
        }
    }

    private createTemplate(contents: string, extraCssClass: string = null): string {
        let templateParts: string[] = [];

        let rowHeight = this.rowNode.rowHeight;
        let rowClasses = this.getInitialRowClasses(extraCssClass).join(' ');

        let rowIdSanitised = _.escape(this.rowNode.id);

        let userRowStyles = this.preProcessStylesFromGridOptions();

        let businessKey = this.getRowBusinessKey();
        let businessKeySanitised = _.escape(businessKey);

        let rowTopStyle = this.getInitialRowTopStyle();

        templateParts.push(`<div`);
        templateParts.push(` role="row"`);
        templateParts.push(` row-index="${this.rowNode.getRowIndexString()}"`);
        templateParts.push(rowIdSanitised ? ` row-id="${rowIdSanitised}"` : ``);
        templateParts.push(businessKey ? ` row-business-key="${businessKeySanitised}"` : ``);
        templateParts.push(` comp-id="${this.getCompId()}"`);
        templateParts.push(` class="${rowClasses}"`);
        templateParts.push(` style="height: ${rowHeight}px; ${rowTopStyle} ${userRowStyles}">`);

        // add in the template for the cells
        templateParts.push(contents);

        templateParts.push(`</div>`);

        return templateParts.join('');
    }

    public getCellForCol(column: Column): HTMLElement {
        let cellComp = this.cellComps[column.getColId()];
        if (cellComp) {
            return cellComp.getGui();
        } else {
            return null;
        }
    }

    public afterFlush(): void {
        if (!this.initialised) {
            this.initialised = true;
            this.executeProcessRowPostCreateFunc();
        }
    }

    private executeProcessRowPostCreateFunc(): void {
        let func = this.beans.gridOptionsWrapper.getProcessRowPostCreateFunc();
        if (func) {
            let params: ProcessRowParams = {
                eRow: this.eBodyRow,
                ePinnedLeftRow: this.ePinnedLeftRow,
                ePinnedRightRow: this.ePinnedRightRow,
                node: this.rowNode,
                api: this.beans.gridOptionsWrapper.getApi(),
                rowIndex: this.rowNode.rowIndex,
                addRenderedRowListener: this.addEventListener.bind(this),
                columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            };
            func(params);
        }
    }

    private getInitialRowTopStyle() {
        // if sliding in, we take the old row top. otherwise we just set the current row top.
        let pixels = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop) : this.rowNode.rowTop;
        let afterPaginationPixels = this.applyPaginationOffset(pixels);
        let afterScalingPixels = this.beans.heightScaler.getRealPixelPosition(afterPaginationPixels);

        if (this.beans.gridOptionsWrapper.isSuppressRowTransform()) {
            return `top: ${afterScalingPixels}px; `;
        } else {
            return `transform: translateY(${afterScalingPixels}px); `;
        }
    }

    private getRowBusinessKey(): string {
        if (typeof this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            let businessKey = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            return businessKey;
        }
    }

    private lazyCreateCells(cols: Column[], eRow: HTMLElement): void {
        if (this.active) {
            let cellTemplatesAndComps = this.createCells(cols);
            eRow.innerHTML = cellTemplatesAndComps.template;
            this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
        }
    }

    private createRowContainer(rowContainerComp: RowContainerComponent, cols: Column[],
                               callback: (eRow: HTMLElement) => void): void {

        let cellTemplatesAndComps: {template: string, cellComps: CellComp[]};
        if (this.useAnimationFrameForCreate) {
            cellTemplatesAndComps = {cellComps: [], template: ''};
        } else {
            cellTemplatesAndComps = this.createCells(cols);
        }

        let rowTemplate = this.createTemplate(cellTemplatesAndComps.template);
        rowContainerComp.appendRowTemplate(rowTemplate, ()=> {
            let eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());
            this.afterRowAttached(rowContainerComp, eRow);
            callback(eRow);

            if (this.useAnimationFrameForCreate) {
                this.beans.taskQueue.addP1Task(this.lazyCreateCells.bind(this, cols, eRow));
            } else {
                this.callAfterRowAttachedOnCells(cellTemplatesAndComps.cellComps, eRow);
            }
        });
    }

    private createChildScopeOrNull(data: any) {
        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            let newChildScope = this.parentScope.$new();
            newChildScope.data = data;
            newChildScope.rowNode = this.rowNode;
            newChildScope.context = this.beans.gridOptionsWrapper.getContext();

            this.addDestroyFunc(() => {
                newChildScope.$destroy();
                newChildScope.data = null;
                newChildScope.rowNode = null;
                newChildScope.context = null;
            });

            return newChildScope;
        } else {
            return null;
        }
    }

    private setupRowContainers(): void {

        let isFullWidthCellFunc = this.beans.gridOptionsWrapper.getIsFullWidthCellFunc();
        let isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;

        let isDetailCell = this.beans.doingMasterDetail && this.rowNode.detail;

        let isGroupSpanningRow = this.rowNode.group && this.beans.gridOptionsWrapper.isGroupUseEntireRow();

        if (this.rowNode.stub) {
            this.createFullWidthRows(RowComp.LOADING_CELL_RENDERER, RowComp.LOADING_CELL_RENDERER_COMP_NAME);
        } else if (isDetailCell) {
            this.createFullWidthRows(RowComp.DETAIL_CELL_RENDERER, RowComp.DETAIL_CELL_RENDERER_COMP_NAME);
        } else if (isFullWidthCell) {
            this.createFullWidthRows(RowComp.FULL_WIDTH_CELL_RENDERER, null);
        } else if (isGroupSpanningRow) {
            this.createFullWidthRows(RowComp.GROUP_ROW_RENDERER, RowComp.GROUP_ROW_RENDERER_COMP_NAME);
        } else {
            this.setupNormalRowContainers();
        }
    }

    private setupNormalRowContainers(): void {
        let centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        this.createRowContainer(this.bodyContainerComp, centerCols, eRow => this.eBodyRow = eRow);

        let leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        let rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, eRow => this.ePinnedRightRow = eRow);
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, eRow => this.ePinnedLeftRow = eRow);
    }

    private createFullWidthRows(type: string, name: string): void {

        this.fullWidthRow = true;
        this.fullWidthRowEmbedded = this.beans.gridOptionsWrapper.isEmbedFullWidthRows();

        if (this.fullWidthRowEmbedded) {

            this.createFullWidthRowContainer(this.bodyContainerComp, null,
                null, type, name,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowBody = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentBody = cellRenderer;
                });
            this.createFullWidthRowContainer(this.pinnedLeftContainerComp, Column.PINNED_LEFT,
                'ag-cell-last-left-pinned', type, name,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowLeft = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentLeft = cellRenderer;
                });
            this.createFullWidthRowContainer(this.pinnedRightContainerComp, Column.PINNED_RIGHT,
                'ag-cell-first-right-pinned', type, name,
                (eRow: HTMLElement) => {
                    this.eFullWidthRowRight = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponentRight = cellRenderer;
                });

        } else {

            // otherwise we add to the fullWidth container as normal
            // let previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.createFullWidthRowContainer(this.fullWidthContainerComp, null,
                null, type, name,
                (eRow: HTMLElement) => {
                    this.eFullWidthRow = eRow;
                },
                (cellRenderer: ICellRendererComp) => {
                    this.fullWidthRowComponent = cellRenderer;
                });
        }
    }

    private setAnimateFlags(animateIn: boolean): void {
        if (animateIn) {
            let oldRowTopExists = _.exists(this.rowNode.oldRowTop);
            // if the row had a previous position, we slide it in (animate row top)
            this.slideRowIn = oldRowTopExists;
            // if the row had no previous position, we fade it in (animate
            this.fadeRowIn = !oldRowTopExists;
        } else {
            this.slideRowIn = false;
            this.fadeRowIn = false;
        }
    }

    public isEditing(): boolean {
        return this.editingRow;
    }

    public stopRowEditing(cancel: boolean): void {
        this.stopEditing(cancel);
    }

    public isFullWidth(): boolean {
        return this.fullWidthRow;
    }

    private addListeners(): void {
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_TOP_CHANGED, this.onTopChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_EXPANDED_CHANGED, this.onExpandedChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DATA_CHANGED, this.onRowNodeDataChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_CELL_CHANGED, this.onRowNodeCellChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_DRAGGING_CHANGED, this.onRowNodeDraggingChanged.bind(this));

        let eventService = this.beans.eventService;
        this.addDestroyableEventListener(eventService, Events.EVENT_HEIGHT_SCALE_CHANGED, this.onTopChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.onVirtualColumnsChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this));
    }

    // when grid columns change, then all cells should be cleaned out,
    // as the new columns could have same id as the previous columns and may conflict
    private onGridColumnsChanged(): void {
        let allRenderedCellIds = Object.keys(this.cellComps);
        this.removeRenderedCells(allRenderedCellIds);
    }

    private onRowNodeDataChanged(event: DataChangedEvent): void {
        // if this is an update, we want to refresh, as this will allow the user to put in a transition
        // into the cellRenderer refresh method. otherwise this might be completely new data, in which case
        // we will want to completely replace the cells
        this.forEachCellComp(cellComp =>
            cellComp.refreshCell({
                suppressFlash: !event.update,
                newData: !event.update
            })
        );

        // check for selected also, as this could be after lazy loading of the row data, in which case
        // the id might of just gotten set inside the row and the row selected state may of changed
        // as a result. this is what happens when selected rows are loaded in virtual pagination.
        // - niall note - since moving to the stub component, this may no longer be true, as replacing
        // the stub component now replaces the entire row
        this.onRowSelected();

        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    }

    private onRowNodeCellChanged(event: CellChangedEvent): void {
        // as data has changed, then the style and class needs to be recomputed
        this.postProcessCss();
    }

    private postProcessCss(): void {
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
        this.postProcessRowClassRules();
        this.postProcessRowDragging();
    }

    private onRowNodeDraggingChanged(): void {
        this.postProcessRowDragging();
    }

    private postProcessRowDragging(): void {
        let dragging = this.rowNode.dragging;
        this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-dragging', dragging) );
    }

    private onExpandedChanged(): void {
        if (this.rowNode.group && !this.rowNode.footer) {
            let expanded = this.rowNode.expanded;
            this.eAllRowContainers.forEach( row => _.addOrRemoveCssClass(row, 'ag-row-group-expanded', expanded));
            this.eAllRowContainers.forEach( row => _.addOrRemoveCssClass(row, 'ag-row-group-contracted', !expanded));
        }
    }

    private onDisplayedColumnsChanged(): void {
        if (!this.fullWidthRow) {
            this.refreshCells();
        }
    }

    private destroyFullWidthComponents(): void {
        if (this.fullWidthRowComponent) {
            if (this.fullWidthRowComponent.destroy) {
                this.fullWidthRowComponent.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentBody) {
            if (this.fullWidthRowComponentBody.destroy) {
                this.fullWidthRowComponentBody.destroy();
            }
            this.fullWidthRowComponent = null;
        }
        if (this.fullWidthRowComponentLeft) {
            if (this.fullWidthRowComponentLeft.destroy) {
                this.fullWidthRowComponentLeft.destroy();
            }
            this.fullWidthRowComponentLeft = null;
        }
        if (this.fullWidthRowComponentRight) {
            if (this.fullWidthRowComponentRight.destroy) {
                this.fullWidthRowComponentRight.destroy();
            }
            this.fullWidthRowComponent = null;
        }
    }

    private getContainerForCell(pinnedType: string): HTMLElement {
        switch (pinnedType) {
            case Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case Column.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
        }
    }

    private onVirtualColumnsChanged(): void {
        if (!this.fullWidthRow) {
            this.refreshCells();
        }
    }

    private onColumnResized(): void {
        if (!this.fullWidthRow) {
            this.refreshCells();
        }
    }

    private refreshCells() {
        if (this.beans.gridOptionsWrapper.isSuppressAnimationFrame()) {
            this.refreshCellsInAnimationFrame();
        } else {
            if (this.columnRefreshPending) { return; }
            this.beans.taskQueue.addP1Task(this.refreshCellsInAnimationFrame.bind(this));
        }
    }

    private refreshCellsInAnimationFrame() {

        if (!this.active) { return; }
        this.columnRefreshPending = false;

        let centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        let leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        let rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);

        this.insertCellsIntoContainer(this.eBodyRow, centerCols);
        this.insertCellsIntoContainer(this.ePinnedLeftRow, leftCols);
        this.insertCellsIntoContainer(this.ePinnedRightRow, rightCols);

        let colIdsToRemove = Object.keys(this.cellComps);
        centerCols.forEach( (col: Column) => _.removeFromArray(colIdsToRemove, col.getId()));
        leftCols.forEach( (col: Column) => _.removeFromArray(colIdsToRemove, col.getId()));
        rightCols.forEach( (col: Column) => _.removeFromArray(colIdsToRemove, col.getId()));

        // we never remove editing cells, as this would cause the cells to loose their values while editing
        // as the grid is scrolling horizontally.
        colIdsToRemove = _.filter(colIdsToRemove, this.isCellEligibleToBeRemoved.bind(this));

        // remove old cells from gui, but we don't destroy them, we might use them again
        this.removeRenderedCells(colIdsToRemove);
    }

    private removeRenderedCells(colIds: string[]): void {
        colIds.forEach( (key: string)=> {
            let cellComp = this.cellComps[key];
            // could be old reference, ie removed cell
            if (_.missing(cellComp)) { return; }

            cellComp.detach();
            cellComp.destroy();
            this.cellComps[key] = null;
        });
    }

    private isCellEligibleToBeRemoved(indexStr: string): boolean {
        let displayedColumns = this.beans.columnController.getAllDisplayedColumns();

        let REMOVE_CELL: boolean = true;
        let KEEP_CELL: boolean = false;
        let renderedCell = this.cellComps[indexStr];

        if (!renderedCell) { return REMOVE_CELL; }

        // always remove the cell if it's in the wrong pinned location
        if (this.isCellInWrongRow(renderedCell)) { return REMOVE_CELL; }

        // we want to try and keep editing and focused cells
        let editing = renderedCell.isEditing();
        let focused = this.beans.focusedCellController.isCellFocused(renderedCell.getGridCell());

        let mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            let column = renderedCell.getColumn();
            let cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        } else {
            return REMOVE_CELL;
        }
    }

    private ensureCellInCorrectContainer(cellComp: CellComp): void {
        let element = cellComp.getGui();
        let column = cellComp.getColumn();
        let pinnedType = column.getPinned();
        let eContainer = this.getContainerForCell(pinnedType);

        // if in wrong container, remove it
        let eOldContainer = cellComp.getParentRow();
        let inWrongRow = eOldContainer !== eContainer;
        if (inWrongRow) {
            // take out from old row
            if (eOldContainer) {
                eOldContainer.removeChild(element);
            }

            eContainer.appendChild(element);
            cellComp.setParentRow(eContainer);
        }
    }

    private isCellInWrongRow(cellComp: CellComp): boolean {
        let column = cellComp.getColumn();
        let rowWeWant = this.getContainerForCell(column.getPinned());

        // if in wrong container, remove it
        let oldRow = cellComp.getParentRow();
        return oldRow !== rowWeWant;
    }

    private insertCellsIntoContainer(eRow: HTMLElement, cols: Column[]): void {
        if (!eRow) { return; }

        let cellTemplates: string[] = [];
        let newCellComps: CellComp[] = [];

        cols.forEach( col => {

            let colId = col.getId();
            let oldCell = this.cellComps[colId];

            if (oldCell) {
                this.ensureCellInCorrectContainer(oldCell);
            } else {
                this.createNewCell(col, eRow, cellTemplates, newCellComps);
            }

        });

        if (cellTemplates.length>0) {
            _.appendHtml(eRow, cellTemplates.join(''));
            this.callAfterRowAttachedOnCells(newCellComps, eRow);
        }
    }

    private addDomData(eRowContainer: Element): void {
        let gow = this.beans.gridOptionsWrapper;
        gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc( ()=> {
            gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, null); }
        );
    }

    private createNewCell(col: Column, eContainer: HTMLElement, cellTemplates: string[], newCellComps: CellComp[]): void {
        let newCellComp = new CellComp(this.scope, this.beans, col, this.rowNode, this, false);
        let cellTemplate = newCellComp.getCreateTemplate();
        cellTemplates.push(cellTemplate);
        newCellComps.push(newCellComp);
        this.cellComps[col.getId()] = newCellComp;
        newCellComp.setParentRow(eContainer);
    }

    public onMouseEvent(eventName: string, mouseEvent: MouseEvent): void {
        switch (eventName) {
            case 'dblclick': this.onRowDblClick(mouseEvent); break;
            case 'click': this.onRowClick(mouseEvent); break;
        }
    }

    private createRowEvent(type: string, domEvent?: Event): RowEvent {
        return {
            type: type,
            node: this.rowNode,
            data: this.rowNode.data,
            rowIndex: this.rowNode.rowIndex,
            rowPinned: this.rowNode.rowPinned,
            context: this.beans.gridOptionsWrapper.getContext(),
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            event: domEvent
        };
    }

    private createRowEventWithSource(type: string, domEvent: Event): RowEvent {
        let event = this.createRowEvent(type, domEvent);
        // when first developing this, we included the rowComp in the event.
        // this seems very weird. so when introducing the event types, i left the 'source'
        // out of the type, and just include the source in the two places where this event
        // was fired (rowClicked and rowDoubleClicked). it doesn't make sense for any
        // users to be using this, as the rowComp isn't an object we expose, so would be
        // very surprising if a user was using it.
        (<any>event).source = this;
        return event;
    }

    private onRowDblClick(mouseEvent: MouseEvent): void {
        if (_.isStopPropagationForAgGrid(mouseEvent)) { return; }

        let agEvent: RowDoubleClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);
    }

    public onRowClick(mouseEvent: MouseEvent) {

        let stop = _.isStopPropagationForAgGrid(mouseEvent);
        if (stop) {
            return;
        }

        let agEvent: RowClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);

        // ctrlKey for windows, metaKey for Apple
        let multiSelectKeyPressed = mouseEvent.ctrlKey || mouseEvent.metaKey;

        let shiftKeyPressed = mouseEvent.shiftKey;

        // we do not allow selecting groups by clicking (as the click here expands the group)
        // so return if it's a group row
        if (this.rowNode.group) {
            return;
        }

        // we also don't allow selection of pinned rows
        if (this.rowNode.rowPinned) {
            return;
        }

        // if no selection method enabled, do nothing
        if (!this.beans.gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (this.beans.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        let multiSelectOnClick = this.beans.gridOptionsWrapper.isRowMultiSelectWithClick();
        let rowDeselectionWithCtrl = this.beans.gridOptionsWrapper.isRowDeselection();

        if (this.rowNode.isSelected()) {

            if (multiSelectOnClick) {
                this.rowNode.setSelectedParams({newValue: false});
            } else if (multiSelectKeyPressed) {
                if (rowDeselectionWithCtrl) {
                    this.rowNode.setSelectedParams({newValue: false});
                }
            } else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({newValue: true, clearSelection: true});
            }
        } else {
            let clearSelection = multiSelectOnClick ? false : !multiSelectKeyPressed;
            this.rowNode.setSelectedParams({newValue: true, clearSelection: clearSelection, rangeSelect: shiftKeyPressed});
        }
    }

    private createFullWidthRowContainer(rowContainerComp: RowContainerComponent, pinned: string,
                                        extraCssClass: string, cellRendererType: string, cellRendererName: string,
                                        eRowCallback: (eRow: HTMLElement) => void,
                                        cellRendererCallback: (comp: ICellRendererComp) => void): void {

        let rowTemplate = this.createTemplate('', extraCssClass);
        rowContainerComp.appendRowTemplate(rowTemplate, ()=> {

            let eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());

            let params = this.createFullWidthParams(eRow, pinned);

            let callback = (cellRenderer: ICellRendererComp)=> {
                if (this.isAlive()) {
                    let gui = cellRenderer.getGui();
                    eRow.appendChild(gui);
                    cellRendererCallback(cellRenderer);
                } else {
                    if (cellRenderer.destroy) {
                        cellRenderer.destroy();
                    }
                }
            };

            this.beans.componentResolver.createAgGridComponent<ICellRendererComp>(null, params, cellRendererType, params, cellRendererName).then(callback);

            this.afterRowAttached(rowContainerComp, eRow);
            eRowCallback(eRow);

            this.angular1Compile(eRow);
        });
    }

    private angular1Compile(element: Element): void {
        if (this.scope) {
            this.beans.$compile(element)(this.scope);
        }
    }

    private createFullWidthParams(eRow: HTMLElement, pinned: string): any {
        let params = {
            fullWidth: true,
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
            $scope: this.scope,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            // these need to be taken out, as part of 'afterAttached' now
            eGridCell: eRow,
            eParentOfValue: eRow,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this)
        };

        return params;
    }

    private getInitialRowClasses(extraCssClass: string): string[] {
        let classes: string[] = [];

        if (_.exists(extraCssClass)) {
            classes.push(extraCssClass);
        }

        classes.push('ag-row');
        classes.push(this.rowFocused ? 'ag-row-focus' : 'ag-row-no-focus');

        if (this.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }

        if (this.rowIsEven) {
            classes.push('ag-row-even');
        } else {
            classes.push('ag-row-odd');
        }

        if (this.rowNode.isSelected()) {
            classes.push('ag-row-selected');
        }

        if (this.rowNode.group) {
            classes.push('ag-row-group');
            // if a group, put the level of the group in
            classes.push('ag-row-level-' + this.rowNode.level);

            if (this.rowNode.footer) {
                classes.push('ag-row-footer');
            }
        } else {
            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
            if (this.rowNode.parent) {
                classes.push('ag-row-level-' + (this.rowNode.parent.level + 1));
            } else {
                classes.push('ag-row-level-0');
            }
        }

        if (this.rowNode.stub) {
            classes.push('ag-row-stub');
        }

        if (this.fullWidthRow) {
            classes.push('ag-full-width-row');
        }

        if (this.rowNode.group && !this.rowNode.footer) {
            classes.push(this.rowNode.expanded ? 'ag-row-group-expanded' : 'ag-row-group-contracted');
        }

        if (this.rowNode.dragging) {
            classes.push('ag-row-dragging');
        }

        _.pushAll(classes, this.processClassesFromGridOptions());
        _.pushAll(classes, this.preProcessRowClassRules());

        return classes;
    }

    private preProcessRowClassRules(): string[] {
        let res: string[] = [];

        this.processRowClassRules(
            (className: string)=> {
                res.push(className);
            },
            (className: string)=> {
                // not catered for, if creating, no need
                // to remove class as it was never there
            }
        );

        return res;
    }

    private processRowClassRules(onApplicableClass: (className: string)=>void, onNotApplicableClass?: (className: string)=>void): void {
        this.beans.stylingService.processClassRules(
            this.beans.gridOptionsWrapper.rowClassRules(),
            {
                value: undefined,
                colDef:undefined,
                data: this.rowNode.data,
                node: this.rowNode,
                rowIndex: this.rowNode.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                $scope: this.scope,
                context: this.beans.gridOptionsWrapper.getContext()
            }, onApplicableClass, onNotApplicableClass);
    }

    public stopEditing(cancel = false): void {
        this.forEachCellComp(renderedCell => {
            renderedCell.stopEditing(cancel);
        });
        if (this.editingRow) {
            if (!cancel) {
                let event: RowValueChangedEvent = this.createRowEvent(Events.EVENT_ROW_VALUE_CHANGED);
                this.beans.eventService.dispatchEvent(event);
            }
            this.setEditingRow(false);
        }
    }

    private setEditingRow(value: boolean): void {
        this.editingRow = value;
        this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-editing', value) );

        let event: RowEvent = value ?
            <RowEditingStartedEvent> this.createRowEvent(Events.EVENT_ROW_EDITING_STARTED)
            : <RowEditingStoppedEvent> this.createRowEvent(Events.EVENT_ROW_EDITING_STOPPED);

        this.beans.eventService.dispatchEvent(event);
    }

    public startRowEditing(keyPress: number = null, charPress: string = null, sourceRenderedCell: CellComp = null): void {
        // don't do it if already editing
        if (this.editingRow) { return; }

        this.forEachCellComp(renderedCell => {
            let cellStartedEdit = renderedCell === sourceRenderedCell;
            if (cellStartedEdit) {
                renderedCell.startEditingIfEnabled(keyPress, charPress, cellStartedEdit);
            } else {
                renderedCell.startEditingIfEnabled(null, null, cellStartedEdit);
            }
        });
        this.setEditingRow(true);
    }

    public forEachCellComp(callback: (renderedCell: CellComp)=>void): void {
        _.iterateObject(this.cellComps, (key: any, cellComp: CellComp)=> {
            if (cellComp) {
                callback(cellComp);
            }
        });
    }

    private postProcessClassesFromGridOptions(): void {
        let cssClasses = this.processClassesFromGridOptions();
        if (cssClasses) {
            cssClasses.forEach( (classStr: string) => {
                this.eAllRowContainers.forEach( row => _.addCssClass(row, classStr));
            });
        }
    }

    private postProcessRowClassRules(): void {
        this.processRowClassRules(
            (className: string)=> {
                this.eAllRowContainers.forEach( row => _.addCssClass(row, className));
            },
            (className: string)=> {
                this.eAllRowContainers.forEach( row => _.removeCssClass(row, className));
            }
        );
    }

    private processClassesFromGridOptions(): string[] {
        let res: string[] = [];

        let process = (rowClass: string | string[]) => {
            if (typeof rowClass === 'string') {
                res.push(rowClass);
            } else if (Array.isArray(rowClass)) {
                rowClass.forEach( e => res.push(e) );
            }
        };

        // part 1 - rowClass
        let rowClass = this.beans.gridOptionsWrapper.getRowClass();
        if (rowClass) {
            if (typeof rowClass === 'function') {
                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
                return;
            }
            process(rowClass);
        }

        // part 2 - rowClassFunc
        let rowClassFunc = this.beans.gridOptionsWrapper.getRowClassFunc();
        if (rowClassFunc) {
            let params = {
                node: this.rowNode,
                data: this.rowNode.data,
                rowIndex: this.rowNode.rowIndex,
                context: this.beans.gridOptionsWrapper.getContext(),
                api: this.beans.gridOptionsWrapper.getApi()
            };
            let rowClassFuncResult = rowClassFunc(params);
            process(rowClassFuncResult);
        }

        return res;
    }

    private preProcessStylesFromGridOptions(): string {
        let rowStyles = this.processStylesFromGridOptions();
        return _.cssStyleObjectToMarkup(rowStyles);
    }

    private postProcessStylesFromGridOptions(): void {
        let rowStyles = this.processStylesFromGridOptions();
        this.eAllRowContainers.forEach( row => _.addStylesToElement(row, rowStyles));
    }

    private processStylesFromGridOptions(): any {

        // part 1 - rowStyle
        let rowStyle = this.beans.gridOptionsWrapper.getRowStyle();

        if (rowStyle && typeof rowStyle === 'function') {
            console.log('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
            return;
        }

        // part 1 - rowStyleFunc
        let rowStyleFunc = this.beans.gridOptionsWrapper.getRowStyleFunc();
        let rowStyleFuncResult: any;
        if (rowStyleFunc) {
            let params = {
                data: this.rowNode.data,
                node: this.rowNode,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext(),
                $scope: this.scope
            };
            rowStyleFuncResult = rowStyleFunc(params);
        }

        return _.assign({}, rowStyle, rowStyleFuncResult);
    }

    private createCells(cols: Column[]): {template: string, cellComps: CellComp[]} {
        let templateParts: string[] = [];
        let newCellComps: CellComp[] = [];
        cols.forEach( col => {
            let newCellComp = new CellComp(this.scope, this.beans, col, this.rowNode, this, false);
            let cellTemplate = newCellComp.getCreateTemplate();
            templateParts.push(cellTemplate);
            newCellComps.push(newCellComp);
            this.cellComps[col.getId()] = newCellComp;
        });
        let templateAndComps = {
            template: templateParts.join(''),
            cellComps: newCellComps
        };
        return templateAndComps;
    }

    private onRowSelected(): void {
        let selected = this.rowNode.isSelected();
        this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-selected', selected) );
    }

    // called:
    // + after row created for first time
    // + after horizontal scroll, so new cells due to column virtualisation
    private callAfterRowAttachedOnCells(newCellComps: CellComp[], eRow: HTMLElement): void {
        newCellComps.forEach( cellComp => {
            cellComp.setParentRow(eRow);
            cellComp.afterAttached();

            // if we are editing the row, then the cell needs to turn
            // into edit mode
            if (this.editingRow) {
                cellComp.startEditingIfEnabled();
            }
        });
    }

    private afterRowAttached(rowContainerComp: RowContainerComponent, eRow: HTMLElement): void {

        this.addDomData(eRow);

        this.removeSecondPassFuncs.push( ()=> {
            // console.log(eRow);
            rowContainerComp.removeRowElement(eRow);
        });
        this.removeFirstPassFuncs.push( ()=> {
            if (_.exists(this.rowNode.rowTop)) {
                // the row top is updated anyway, however we set it here again
                // to something more reasonable for the animation - ie if the
                // row top is 10000px away, the row will flash out, so this
                // gives it a rounded value, so row animates out more slowly
                let rowTop = this.roundRowTopToBounds(this.rowNode.rowTop);
                this.setRowTop(rowTop);
            } else {
                _.addCssClass(eRow, 'ag-opacity-zero');
            }
        });

        this.eAllRowContainers.push(eRow);

        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.useAnimationFrameForCreate) {
            this.beans.taskQueue.addP1Task(this.addHoverFunctionality.bind(this, eRow));
        } else {
            this.addHoverFunctionality(eRow);
        }
    }

    private addHoverFunctionality(eRow: HTMLElement): void {

        // because we use animation frames to do this, it's possible the row no longer exists
        // by the time we get to add it
        if (!this.active) {
            return;
        }

        // because mouseenter and mouseleave do not propagate, we cannot listen on the gridPanel
        // like we do for all the other mouse events.

        // because of the pinning, we cannot simply add / remove the class based on the eRow. we
        // have to check all eRow's (body & pinned). so the trick is if any of the rows gets a
        // mouse hover, it sets such in the rowNode, and then all three reflect the change as
        // all are listening for event on the row node.

        // step 1 - add listener, to set flag on row node
        this.addDestroyableEventListener(eRow, 'mouseenter', () => this.rowNode.onMouseEnter() );
        this.addDestroyableEventListener(eRow, 'mouseleave', () => this.rowNode.onMouseLeave() );

        // step 2 - listen for changes on row node (which any eRow can trigger)
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_MOUSE_ENTER, ()=> {
            // if hover turned off, we don't add the class. we do this here so that if the application
            // toggles this property mid way, we remove the hover form the last row, but we stop
            // adding hovers from that point onwards.
            if (!this.beans.gridOptionsWrapper.isSuppressRowHoverHighlight()) {
                _.addCssClass(eRow, 'ag-row-hover');
            }
        });
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_MOUSE_LEAVE, ()=> {
            _.removeCssClass(eRow, 'ag-row-hover');
        });
    }

    // for animation, we don't want to animate entry or exit to a very far away pixel,
    // otherwise the row would move so fast, it would appear to disappear. so this method
    // moves the row closer to the viewport if it is far away, so the row slide in / out
    // at a speed the user can see.
    private roundRowTopToBounds(rowTop: number): number {
        let range = this.beans.gridPanel.getVScrollPosition();

        let minPixel = this.applyPaginationOffset(range.top, true) - 100;
        let maxPixel = this.applyPaginationOffset(range.bottom, true) + 100;

        if (rowTop < minPixel) {
            return minPixel;
        } else if (rowTop > maxPixel) {
            return maxPixel;
        } else {
            return rowTop;
        }
    }

    private onRowHeightChanged(): void {
        // check for exists first - if the user is resetting the row height, then
        // it will be null (or undefined) momentarily until the next time the flatten
        // stage is called where the row will then update again with a new height
        if (_.exists(this.rowNode.rowHeight)) {
            let heightPx = this.rowNode.rowHeight + 'px';
            this.eAllRowContainers.forEach( row => row.style.height = heightPx);
        }
    }

    public addEventListener(eventType: string, listener: Function): void {
        if (eventType==='renderedRowRemoved' || eventType==='rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        super.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (eventType==='renderedRowRemoved' || eventType==='rowRemoved') {
            eventType = Events.EVENT_VIRTUAL_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved and rowRemoved is now called ' + Events.EVENT_VIRTUAL_ROW_REMOVED);
        }
        super.removeEventListener(eventType, listener);
    }

    public destroy(animate = false): void {
        super.destroy();

        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        this.destroyFullWidthComponents();

        if (animate) {

            this.removeFirstPassFuncs.forEach( func => func() );
            this.removeSecondPassFuncs.push(this.destroyContainingCells.bind(this));

        } else {
            this.destroyContainingCells();

            // we are not animating, so execute the second stage of removal now.
            // we call getAndClear, so that they are only called once
            let delayedDestroyFunctions = this.getAndClearDelayedDestroyFunctions();
            delayedDestroyFunctions.forEach( func => func() );
        }

        let event: VirtualRowRemovedEvent = this.createRowEvent(Events.EVENT_VIRTUAL_ROW_REMOVED);

        this.dispatchEvent(event);
        this.beans.eventService.dispatchEvent(event);
    }

    private destroyContainingCells(): void {
        this.forEachCellComp(renderedCell => renderedCell.destroy() );
        this.destroyFullWidthComponents();
    }

    // we clear so that the functions are never executed twice
    public getAndClearDelayedDestroyFunctions(): Function[] {
        let result = this.removeSecondPassFuncs;
        this.removeSecondPassFuncs = [];
        return result;
    }

    private onCellFocusChanged(): void {
        let rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);
        if (rowFocused !== this.rowFocused) {
            this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused) );
            this.eAllRowContainers.forEach( (row) => _.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused) );
            this.rowFocused = rowFocused;
        }

        // if we are editing, then moving the focus out of a row will stop editing
        if (!rowFocused && this.editingRow) {
            this.stopEditing(false);
        }
    }

    private onPaginationChanged(): void {
        let currentPage = this.beans.paginationProxy.getCurrentPage();
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        if (this.paginationPage!==currentPage) {
            this.paginationPage = currentPage;
            this.onTopChanged();
        }
    }

    private onTopChanged(): void {
        this.setRowTop(this.rowNode.rowTop);
    }

    // applies pagination offset, eg if on second page, and page height is 500px, then removes
    // 500px from the top position, so a row with rowTop 600px is displayed at location 100px.
    // reverse will take the offset away rather than add.
    private applyPaginationOffset(topPx: number, reverse = false): number {
        if (this.rowNode.isRowPinned()) {
            return topPx;
        } else {
            let pixelOffset = this.beans.paginationProxy.getPixelOffset();
            if (reverse) {
                return topPx + pixelOffset;
            } else {
                return topPx - pixelOffset;
            }
        }
    }

    private setRowTop(pixels: number): void {
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (_.exists(pixels)) {
            let afterPaginationPixels = this.applyPaginationOffset(pixels);

            let afterScalingPixels = this.beans.heightScaler.getRealPixelPosition(afterPaginationPixels);

            let topPx = afterScalingPixels + "px";
            if (this.beans.gridOptionsWrapper.isSuppressRowTransform()) {
                this.eAllRowContainers.forEach( row => row.style.top = `${topPx}` );
            } else {
                this.eAllRowContainers.forEach( row => row.style.transform = `translateY(${topPx})` );
            }
        }
    }

    // we clear so that the functions are never executed twice
    public getAndClearNextVMTurnFunctions(): Function[] {
        let result = this.createSecondPassFuncs;
        this.createSecondPassFuncs = [];
        return result;
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public getRenderedCellForColumn(column: Column): CellComp {
        return this.cellComps[column.getColId()];
    }

    private onRowIndexChanged(): void {
        this.onCellFocusChanged();
        this.updateRowIndexes();
    }

    private updateRowIndexes(): void {
        let rowIndexStr = this.rowNode.getRowIndexString();

        let rowIsEven = this.rowNode.rowIndex % 2 === 0;
        let rowIsEvenChanged = this.rowIsEven !== rowIsEven;
        if (rowIsEvenChanged) {
            this.rowIsEven = rowIsEven;
        }

        this.eAllRowContainers.forEach( eRow => {
            eRow.setAttribute('row-index', rowIndexStr);

            if (rowIsEvenChanged) {
                _.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
                _.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
            }
        });
    }

    public ensureDomOrder(): void {
        let body = this.getBodyRowElement();
        if (body) {
            this.bodyContainerComp.ensureDomOrder(body);
        }

        let left = this.getPinnedLeftRowElement();
        if (left) {
            this.pinnedLeftContainerComp.ensureDomOrder(left);
        }

        let right = this.getPinnedRightRowElement();
        if (right) {
            this.pinnedRightContainerComp.ensureDomOrder(right);
        }

        let fullWidth = this.getFullWidthRowElement();
        if (fullWidth) {
            this.fullWidthContainerComp.ensureDomOrder(fullWidth);
        }
    }

    // returns the pinned left container, either the normal one, or the embedded full with one if exists
    public getPinnedLeftRowElement(): HTMLElement {
        return this.ePinnedLeftRow ? this.ePinnedLeftRow : this.eFullWidthRowLeft;
    }

    // returns the pinned right container, either the normal one, or the embedded full with one if exists
    public getPinnedRightRowElement(): HTMLElement {
        return this.ePinnedRightRow ? this.ePinnedRightRow : this.eFullWidthRowRight;
    }

    // returns the body container, either the normal one, or the embedded full with one if exists
    public getBodyRowElement(): HTMLElement {
        return this.eBodyRow ? this.eBodyRow : this.eFullWidthRowBody;
    }

    // returns the full width container
    public getFullWidthRowElement(): HTMLElement {
        return this.eFullWidthRow;
    }

}