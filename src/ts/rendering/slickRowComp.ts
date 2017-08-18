import {Component} from "../widgets/component";
import {IRowComp, LastPlacedElements, RowComp} from "./rowComp";
import {DataChangedEvent, RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Beans} from "./beans";
import {RowContainerComponent} from "./rowContainerComponent";
import {_, NumberSequence} from "../utils";
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
import {SlickCellComp} from "./slickCellComp";
import {ICellComp} from "./cellComp";
import {EventService} from "../eventService";
import {ICellRendererComp, ICellRendererFunc} from "./cellRenderers/iCellRenderer";
import {IAfterGuiAttachedParams} from "../interfaces/iComponent";

export class SlickRowComp extends Component implements IRowComp {

    private renderedRowEventService: EventService;

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
    private fullWidthCellRenderer: {new(): ICellRendererComp} | ICellRendererFunc | string;
    private fullWidthCellRendererParams: any;

    private editingRow: boolean;
    private rowFocused: boolean;

    private slickCellComps: {[key: string]: SlickCellComp} = {};

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

    private rowIsEven: boolean;

    private paginationPage: number;

    private parentScope: any;
    private scope: any;

    // todo - review row dom order
    private lastPlacedElements: LastPlacedElements;

    constructor(parentScope: any,
                bodyContainerComp: RowContainerComponent,
                pinnedLeftContainerComp: RowContainerComponent,
                pinnedRightContainerComp: RowContainerComponent,
                fullWidthContainerComp: RowContainerComponent,
                rowNode: RowNode,
                beans: Beans,
                animateIn: boolean) {
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

    private createTemplate(contents: string, extraCssClass: string): string {
        let templateParts: string[] = [];

        let rowHeight = this.rowNode.rowHeight;
        let rowClasses = this.getInitialRowClasses(extraCssClass).join(' ');
        let rowId = this.rowNode.id;

        let userRowStyles = this.preProcessStylesFromGridOptions();

        let businessKey = this.getRowBusinessKey();
        let rowTopStyle = this.getInitialRowTopStyle();

        templateParts.push(`<div`);
        templateParts.push(` role="row"`);
        templateParts.push(` row-index="${this.rowNode.getRowIndexString()}"`);
        templateParts.push(rowId ? ` row-id="${rowId}"` : ``);
        templateParts.push(businessKey ? ` row-business-key="${businessKey}"` : ``);
        templateParts.push(` comp-id="${this.getCompId()}"`);
        templateParts.push(` class="${rowClasses}"`);
        templateParts.push(` style="height: ${rowHeight}px; ${rowTopStyle} ${userRowStyles}">`);

        // add in the template for the cells
        templateParts.push(contents);

        templateParts.push(`</div>`);

        return templateParts.join('');
    }

    private getInitialRowTopStyle() {
        let rowTopStyle = '';
        let setRowTop = !this.beans.gridOptionsWrapper.isForPrint() && !this.beans.gridOptionsWrapper.isAutoHeight();
        if (setRowTop) {
            // if sliding in, we take the old row top. otherwise we just set the current row top.
            let rowTop = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop) : this.rowNode.rowTop;
            // if not setting row top, then below is empty string
            rowTopStyle = `top: ${rowTop}px; `;
        }
        return rowTopStyle;
    }

    private getRowBusinessKey(): string {
        if (typeof this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
            let businessKey = this.beans.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
            return businessKey;
        }
    }

    private createRowContainer(rowContainerComp: RowContainerComponent, cols: Column[],
                               callback: (eRow: HTMLElement) => void): void {
        let cellTemplatesAndComps = this.createCells(cols);
        let rowTemplate = this.createTemplate(cellTemplatesAndComps.template, null);
        rowContainerComp.appendRowTemplateAsync(rowTemplate, ()=> {
            let eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());
            this.afterRowAttached(rowContainerComp, cellTemplatesAndComps.cellComps, eRow);
            callback(eRow);
        });
    }

    private createChildScopeOrNull(data: any) {
        if (this.beans.gridOptionsWrapper.isAngularCompileRows()) {
            let newChildScope = this.parentScope.$new();
            newChildScope.data = data;
            newChildScope.rowNode = this.rowNode;
            newChildScope.context = this.beans.gridOptionsWrapper.getContext();
            return newChildScope;
        } else {
            return null;
        }
    }

    private setupRowContainers(): void {

        let isFullWidthCellFunc = this.beans.gridOptionsWrapper.getIsFullWidthCellFunc();
        let isFullWidthCell = isFullWidthCellFunc ? isFullWidthCellFunc(this.rowNode) : false;
        let isGroupSpanningRow = this.rowNode.group && this.beans.gridOptionsWrapper.isGroupUseEntireRow();

        if (isFullWidthCell) {
            this.setupFullWidthContainers();
        } else if (isGroupSpanningRow) {
            this.setupFullWidthGroupContainers();
        } else {
            this.setupNormalRowContainers();
        }

    }

    private setupFullWidthContainers(): void {
        this.fullWidthRow = true;
        this.fullWidthRowEmbedded = this.beans.gridOptionsWrapper.isEmbedFullWidthRows();
        this.fullWidthCellRenderer = this.beans.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.beans.gridOptionsWrapper.getFullWidthCellRendererParams();

        if (_.missing(this.fullWidthCellRenderer)) {
            console.warn(`ag-Grid: you need to provide a fullWidthCellRenderer if using isFullWidthCell()`);
        }

        this.createFullWidthRows();
    }

    private setupFullWidthGroupContainers(): void {
        this.fullWidthRow = true;
        this.fullWidthRowEmbedded = this.beans.gridOptionsWrapper.isEmbedFullWidthRows();
        this.fullWidthCellRenderer = this.beans.gridOptionsWrapper.getFullWidthCellRenderer();
        this.fullWidthCellRendererParams = this.beans.gridOptionsWrapper.getFullWidthCellRendererParams();

        this.createFullWidthRows();
    }

    private setupNormalRowContainers(): void {
        let centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        let leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        let rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);

        this.createRowContainer(this.bodyContainerComp, centerCols, eRow => this.eBodyRow = eRow);
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, eRow => this.ePinnedRightRow = eRow);
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, eRow => this.ePinnedLeftRow = eRow);
    }

    private createFullWidthRows(): void {
        let ensureDomOrder = _.exists(this.lastPlacedElements);

        if (this.fullWidthRowEmbedded) {

            // if embedding the full width, it gets added to the body, left and right
            // let previousBody = ensureDomOrder ? this.lastPlacedElements.eBody : null;
            // let previousLeft = ensureDomOrder ? this.lastPlacedElements.eLeft : null;
            // let previousRight = ensureDomOrder ? this.lastPlacedElements.eRight : null;

            this.createFullWidthRowContainer(this.bodyContainerComp, null, null,
                (eRow: HTMLElement, cellRenderer: ICellRendererComp) => {
                            this.eFullWidthRowBody = eRow;
                            this.fullWidthRowComponentBody = cellRenderer;
                        });
            this.createFullWidthRowContainer(this.pinnedLeftContainerComp, Column.PINNED_LEFT, 'ag-cell-last-left-pinned',
                (eRow: HTMLElement, cellRenderer: ICellRendererComp) => {
                            this.eFullWidthRowLeft = eRow;
                            this.fullWidthRowComponentLeft = cellRenderer;
                        });
            this.createFullWidthRowContainer(this.pinnedRightContainerComp, Column.PINNED_RIGHT, 'ag-cell-first-right-pinned',
                (eRow: HTMLElement, cellRenderer: ICellRendererComp) => {
                            this.eFullWidthRowRight = eRow;
                            this.fullWidthRowComponentRight = cellRenderer;
                        });

        } else {

            // otherwise we add to the fullWidth container as normal
            // let previousFullWidth = ensureDomOrder ? this.lastPlacedElements.eFullWidth : null;
            this.createFullWidthRowContainer(this.fullWidthContainerComp, null, null,
                (eRow: HTMLElement, cellRenderer: ICellRendererComp) => {
                    this.eFullWidthRow = eRow;
                    this.fullWidthRowComponent = cellRenderer;
                    // and fake the mouse wheel for the fullWidth container
                    if (!this.beans.gridOptionsWrapper.isForPrint()) {
                        this.addMouseWheelListenerToFullWidthRow();
                    }
                });
        }
    }

    private addMouseWheelListenerToFullWidthRow(): void {
        let mouseWheelListener = this.beans.gridPanel.genericMouseWheelListener.bind(this.beans.gridPanel);
        // IE9, Chrome, Safari, Opera
        this.addDestroyableEventListener(this.eFullWidthRow, 'mousewheel', mouseWheelListener);
        // Firefox
        this.addDestroyableEventListener(this.eFullWidthRow, 'DOMMouseScroll', mouseWheelListener);
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
        return false;
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

        let eventService = this.beans.eventService;
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
        let allRenderedCellIds = Object.keys(this.slickCellComps);
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
        this.postProcessStylesFromGridOptions();
        this.postProcessClassesFromGridOptions();
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

    private onVirtualColumnsChanged() {
        if (!this.fullWidthRow) {
            this.refreshCells();
        }
    }

    private onColumnResized() {
        if (!this.fullWidthRow) {
            this.refreshCells();
        }
    }

    private refreshCells() {

        let centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        let leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        let rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);

        this.insertCellsIntoContainer(this.eBodyRow, centerCols);
        this.insertCellsIntoContainer(this.ePinnedLeftRow, leftCols);
        this.insertCellsIntoContainer(this.ePinnedRightRow, rightCols);

        let colIdsToRemove = Object.keys(this.slickCellComps);
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
            let slickCellComp = this.slickCellComps[key];
            // could be old reference, ie removed cell
            if (_.missing(slickCellComp)) { return; }

            slickCellComp.detach();
            slickCellComp.destroy();
            this.slickCellComps[key] = null;
        });
    }

    private isCellEligibleToBeRemoved(indexStr: string): boolean {
        // todo: this should reuse the logic form the other cellComp
        return true;
    }

    private ensureCellInCorrectContainer(slickCellComp: SlickCellComp): void {
        let eCell = slickCellComp.getGui();
        let column = slickCellComp.getColumn();
        let pinnedType = column.getPinned();
        let eContainer = this.getContainerForCell(pinnedType);

        // if in wrong container, remove it
        let eOldContainer = slickCellComp.getParentRow();
        let inWrongRow = eOldContainer !== eContainer;
        if (inWrongRow) {
            // take out from old row
            if (eOldContainer) {
                eOldContainer.removeChild(eCell);
            }

            eContainer.appendChild(eCell);
            slickCellComp.setParentRow(eContainer);
        }
    }

    private insertCellsIntoContainer(eContainer: HTMLElement, cols: Column[]): void {
        if (!eContainer) { return; }

        let cellTemplates: string[] = [];
        let newCellComps: SlickCellComp[] = [];

        cols.forEach( col => {

            let colId = col.getId();
            let oldCell = this.slickCellComps[colId];

            if (oldCell) {
                this.ensureCellInCorrectContainer(oldCell);
            } else {
                this.createNewCell(col, eContainer, cellTemplates, newCellComps);
            }

        });

        if (cellTemplates.length>0) {
            _.appendHtml(eContainer, cellTemplates.join(''));
            newCellComps.forEach( c => c.afterAttached() );
        }
    }

    private addDomData(eRowContainer: Element): void {
        let gow = this.beans.gridOptionsWrapper;
        gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, this);
        this.addDestroyFunc( ()=> {
            gow.setDomData(eRowContainer, RowComp.DOM_DATA_KEY_RENDERED_ROW, null) }
        );
    }

    private createNewCell(col: Column, eContainer: HTMLElement, cellTemplates: string[], newCellComps: SlickCellComp[]): void {
        let newCellComp = new SlickCellComp(this.scope, this.beans, col, this.rowNode, this);
        let cellTemplate = newCellComp.getCreateTemplate();
        cellTemplates.push(cellTemplate);
        newCellComps.push(newCellComp);
        this.slickCellComps[col.getId()] = newCellComp;
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
        }
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
        return event
    }

    private onRowDblClick(mouseEvent: MouseEvent): void {

        let agEvent: RowDoubleClickedEvent = this.createRowEventWithSource(Events.EVENT_ROW_DOUBLE_CLICKED, mouseEvent);

        this.beans.eventService.dispatchEvent(agEvent);
    }

    public onRowClick(mouseEvent: MouseEvent) {

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

        if (this.rowNode.isSelected()) {
            if (multiSelectKeyPressed) {
                if (this.beans.gridOptionsWrapper.isRowDeselection()) {
                    this.rowNode.setSelectedParams({newValue: false});
                }
            } else {
                // selected with no multi key, must make sure anything else is unselected
                this.rowNode.setSelectedParams({newValue: true, clearSelection: true});
            }
        } else {
            this.rowNode.setSelectedParams({newValue: true, clearSelection: !multiSelectKeyPressed, rangeSelect: shiftKeyPressed});
        }
    }

    private createFullWidthRowContainer(rowContainerComp: RowContainerComponent, pinned: string, extraCssClass: string,
                               callback: (eRow: HTMLElement, comp: ICellRendererComp) => void): void {

        let params = this.createFullWidthParams(pinned);

        let cellRenderer = this.beans.componentRecipes.newFullRowGroupRenderer (params);

        let gui = cellRenderer.getGui();
        let guiIsTemplate = typeof gui === 'string';
        let cellTemplate = guiIsTemplate ? <string><any> gui : '';

        let rowTemplate = this.createTemplate(cellTemplate, extraCssClass);
        rowContainerComp.appendRowTemplateAsync(rowTemplate, ()=> {

            let eRow: HTMLElement = rowContainerComp.getRowElement(this.getCompId());

            let eCell: HTMLElement;
            if (guiIsTemplate) {
                eCell = <HTMLElement> eRow.firstChild;
            } else {
                eRow.appendChild(gui);
                eCell = gui;
            }

            if (cellRenderer.afterGuiAttached) {
                let params = {
                    eGridCell: eRow,
                    eParentOfValue: eRow,
                    eComponent: eCell
                };
                cellRenderer.afterGuiAttached(<IAfterGuiAttachedParams> params);
            }

            this.afterRowAttached(rowContainerComp, [], eRow);
            callback(eRow, cellRenderer);

            this.angular1Compile(eRow);
        });
    }

    private angular1Compile(element: Element): void {
        if (this.scope) {
            this.beans.$compile(element)(this.scope);
        }
    }

    private createFullWidthParams(pinned: string): any {
        let params = {
            data: this.rowNode.data,
            node: this.rowNode,
            value: this.rowNode.key,
            $scope: this.scope,
            rowIndex: this.rowNode.rowIndex,
            api: this.beans.gridOptionsWrapper.getApi(),
            columnApi: this.beans.gridOptionsWrapper.getColumnApi(),
            context: this.beans.gridOptionsWrapper.getContext(),
            // these need to be taken out, as part of 'afterAttached' now
            eGridCell: <HTMLElement> null,
            eParentOfValue: <HTMLElement> null,
            pinned: pinned,
            addRenderedRowListener: this.addEventListener.bind(this),
            colDef: {
                cellRenderer: this.fullWidthCellRenderer,
                cellRendererParams: this.fullWidthCellRendererParams
            }
        };

        if (this.fullWidthCellRendererParams) {
            _.assign(params, this.fullWidthCellRendererParams);
        }

        return params;
    }

    private getInitialRowClasses(extraCssClass: string): string[] {
        let classes: string[] = [];

        if (_.exists(extraCssClass)) {
            classes.push(extraCssClass);
        }

        classes.push('ag-row');
        classes.push('ag-row-no-focus');
        classes.push(this.rowFocused ? 'ag-row-no-focus' : 'ag-row-focus');

        if (this.fadeRowIn) {
            classes.push('ag-opacity-zero');
        }

        if (this.rowIsEven) {
            classes.push('ag-row-even');
        } else {
            classes.push('ag-row-odd');
        }

        if (this.beans.gridOptionsWrapper.isAnimateRows()) {
            classes.push('ag-row-animation');
        } else {
            classes.push('ag-row-no-animation');
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

        _.pushAll(classes, this.processClassesFromGridOptions());

        return classes;
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

    public startRowEditing(keyPress: number = null, charPress: string = null, sourceRenderedCell: ICellComp = null): void {
        // don't do it if already editing
        if (this.editingRow) { return; }

        this.forEachCellComp(renderedCell => {
            let cellStartedEdit = renderedCell === sourceRenderedCell;
            if (cellStartedEdit) {
                renderedCell.startEditingIfEnabled(keyPress, charPress, cellStartedEdit)
            } else {
                renderedCell.startEditingIfEnabled(null, null, cellStartedEdit)
            }
        });
        this.setEditingRow(true);
    }

    public forEachCellComp(callback: (renderedCell: ICellComp)=>void): void {
        _.iterateObject(this.slickCellComps, (key: any, cellComp: ICellComp)=> {
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

    private createCells(cols: Column[]): {template: string, cellComps: SlickCellComp[]} {
        let templateParts: string[] = [];
        let newCellComps: SlickCellComp[] = [];
        cols.forEach( col => {
            let newCellComp = new SlickCellComp(this.scope, this.beans, col, this.rowNode, this);
            let cellTemplate = newCellComp.getCreateTemplate();
            templateParts.push(cellTemplate);
            newCellComps.push(newCellComp);
            this.slickCellComps[col.getId()] = newCellComp;
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

    private afterRowAttached(rowContainerComp: RowContainerComponent, newCellComps: SlickCellComp[], eRow: HTMLElement): void {
        newCellComps.forEach( cellComp => {
            cellComp.setParentRow(eRow);
            cellComp.afterAttached();
        });

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

        this.addHoverFunctionality(eRow);
    }

    private addHoverFunctionality(eRow: HTMLElement): void {
        // because we are adding listeners to the row, we give the user the choice to not add
        // the hover class, as it slows things down, especially in IE, when you add listeners
        // to each row. we cannot do the trick of adding one listener to the GridPanel (like we
        // do for other mouse events) as these events don't propagate
        if (!this.beans.gridOptionsWrapper.isRowHoverClass()) { return; }

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
            _.addCssClass(eRow, 'ag-row-hover');
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
        let range = this.beans.gridPanel.getVerticalPixelRange();
        let minPixel = range.top - 100;
        let maxPixel = range.bottom + 100;
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
        if (eventType==='renderedRowRemoved') {
            eventType = RowComp.EVENT_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + RowComp.EVENT_ROW_REMOVED);
        }
        if (!this.renderedRowEventService) { this.renderedRowEventService = new EventService(); }
        this.renderedRowEventService.addEventListener(eventType, listener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        if (eventType==='renderedRowRemoved') {
            eventType = RowComp.EVENT_ROW_REMOVED;
            console.warn('ag-Grid: Since version 11, event renderedRowRemoved is now called ' + RowComp.EVENT_ROW_REMOVED);
        }
        this.renderedRowEventService.removeEventListener(eventType, listener);
    }

    private destroyScope(): void {
        if (this.scope) {
            this.scope.$destroy();
            this.scope = null;
        }
    }

    public destroy(animate = false): void {
        super.destroy();
        this.destroyScope();

        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        // fixme
        // this.destroyScope();
        // this.destroyFullWidthComponent();

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

        if (this.renderedRowEventService) {
            this.renderedRowEventService.dispatchEvent(event);
        }
        this.beans.eventService.dispatchEvent(event);
    }

    private destroyContainingCells(): void {
        this.forEachCellComp(renderedCell => renderedCell.destroy(false) );
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
        // top is not used in forPrint, as the rows are just laid out naturally
        let doNotSetRowTop = this.beans.gridOptionsWrapper.isForPrint() || this.beans.gridOptionsWrapper.isAutoHeight();
        if (doNotSetRowTop) { return; }

        this.setRowTop(this.rowNode.rowTop);
    }

    private setRowTop(pixels: number): void {
        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        if (_.exists(pixels)) {

            let pixelsWithOffset: number;
            if (this.rowNode.isRowPinned()) {
                pixelsWithOffset = pixels;
            } else {
                pixelsWithOffset = pixels - this.beans.paginationProxy.getPixelOffset();
            }

            let topPx = pixelsWithOffset + "px";
            this.eAllRowContainers.forEach( row => row.style.top = topPx);
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

    public getRenderedCellForColumn(column: Column): ICellComp {
        return this.slickCellComps[column.getColId()];
    }

    private onRowIndexChanged(): void {
        this.onCellFocusChanged();
        this.updateRowIndexes();
    }

    private updateRowIndexes(): void {
        let rowIndexStr = this.rowNode.getRowIndexString();

        this.eAllRowContainers.forEach( eRow => {
            eRow.setAttribute('index', rowIndexStr);

            let rowIsEven = this.rowNode.rowIndex % 2 === 0;
            if (this.rowIsEven!==rowIsEven) {
                this.rowIsEven = rowIsEven;
                _.addOrRemoveCssClass(eRow, 'ag-row-even', rowIsEven);
                _.addOrRemoveCssClass(eRow, 'ag-row-odd', !rowIsEven);
            }
        });
    }

    public ensureInDomAfter(previousElement: LastPlacedElements): void {}

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