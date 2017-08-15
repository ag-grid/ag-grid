
import {Component} from "../widgets/component";
import {IRowComp, LastPlacedElements, RowComp} from "./rowComp";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Beans} from "./beans";
import {RowContainerComponent} from "./rowContainerComponent";
import {_} from "../utils";
import {
    Events, RowClickedEvent, RowDoubleClickedEvent, RowEditingStartedEvent, RowEditingStoppedEvent, RowEvent,
    RowValueChangedEvent, VirtualRowRemovedEvent
} from "../events";
import {SlickCellComp} from "./slickCellComp";
import {CellComp, ICellComp} from "./cellComp";
import {EventService} from "../eventService";
import {Constants} from "../constants";

export class SlickRowComp extends Component implements IRowComp {

    private renderedRowEventService: EventService;

    private beans: Beans;
    private bodyContainerComp: RowContainerComponent;
    private pinnedLeftContainerComp: RowContainerComponent;
    private pinnedRightContainerComp: RowContainerComponent;
    private rowNode: RowNode;

    private ePinnedLeftRow: HTMLElement;
    private ePinnedRightRow: HTMLElement;
    private eBodyRow: HTMLElement;
    private eAllRowContainers: HTMLElement[] = [];

    private active = true;

    private fullWidthRow: boolean;
    private editingRow: boolean;
    private rowFocused: boolean;

    private slickCellComps: {[key: string]: SlickCellComp} = {};

    // for animations, there are bits we want done in the next VM turn, to all DOM to update first.
    // instead of each row doing a setTimeout(func,0), we put the functions here and the rowRenderer
    // executes them all in one timeout
    private nextVmTurnFunctions: Function[] = [];

    // for animations, these functions get called 400ms after the row is cleared, called by the rowRenderer
    // so each row isn't setting up it's own timeout
    private delayedDestroyFunctions: Function[] = [];

    // these get called before the row is destroyed - they set up the DOM for the remove animation (ie they
    // set the DOM up for the animation), then the delayedDestroyFunctions get called when the animation is
    // complete (ie removes from the dom).
    private startRemoveAnimationFunctions: Function[] = [];

    private fadeRowIn: boolean;
    private slideRowIn: boolean;

    private rowIsEven: boolean;

    constructor(bodyContainerComp: RowContainerComponent,
                pinnedLeftContainerComp: RowContainerComponent,
                pinnedRightContainerComp: RowContainerComponent,
                rowNode: RowNode,
                beans: Beans,
                animateIn: boolean) {
        super();
        this.beans = beans;
        this.bodyContainerComp = bodyContainerComp;
        this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        this.pinnedRightContainerComp = pinnedRightContainerComp;
        this.rowNode = rowNode;
        this.rowIsEven = this.rowNode.rowIndex % 2 === 0;
        this.setAnimateFlags(animateIn);
    }

    private setAnimateFlags(animateIn: boolean): void {
        if (animateIn) {
            let oldRowTopExists = _.exists(this.rowNode.oldRowTop);
            // if the row had a previous position, we slide it in (animate row top)
            this.slideRowIn = oldRowTopExists;
            // if the row had no previous position, we fade it in (animate opacity)
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

    public init(): void {
        this.rowFocused = this.beans.focusedCellController.isRowFocused(this.rowNode.rowIndex, this.rowNode.rowPinned);

        let centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        let leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        let rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);

        this.createRowContainer(this.bodyContainerComp, centerCols, eRow => this.eBodyRow = eRow);
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, eRow => this.ePinnedRightRow = eRow);
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, eRow => this.ePinnedLeftRow = eRow);

        this.addListeners();

        if (this.slideRowIn) {
            this.nextVmTurnFunctions.push( () => {
                this.onTopChanged();
            });
        }
        if (this.fadeRowIn) {
            this.nextVmTurnFunctions.push( () => {
                this.eAllRowContainers.forEach(eRow => _.removeCssClass(eRow, 'ag-opacity-zero'));
            });
        }
    }

    private addListeners(): void {
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_INDEX_CHANGED, this.onRowIndexChanged.bind(this));

        let eventService = this.beans.eventService;
        this.addDestroyableEventListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_COLUMN_RESIZED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_CELL_FOCUSED, this.onCellFocusChanged.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_PAGINATION_CHANGED, this.onPaginationChanged.bind(this));

        // fixme - for this we should be clearing out everything, should inherit this from super component
        this.addDestroyableEventListener(eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshCells.bind(this));
    }

    private getContainerForCell(pinnedType: string): HTMLElement {
        switch (pinnedType) {
            case Column.PINNED_LEFT: return this.ePinnedLeftRow;
            case Column.PINNED_RIGHT: return this.ePinnedRightRow;
            default: return this.eBodyRow;
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
        let newCellComp = new SlickCellComp(this.beans, col, this.rowNode, this);
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

    private createRowContainer(rowContainerComp: RowContainerComponent, cols: Column[],
                               callback: (eRow: HTMLElement) => void): void {
        let rowTemplate = this.createTemplate(cols);
        rowContainerComp.appendRowTemplateAsync(rowTemplate.rowTemplate, ()=> {
            let eRow: HTMLElement = rowContainerComp.getRowElement(this.rowNode.id);
            this.afterRowAttached(rowContainerComp, rowTemplate.newCellComps, eRow);
            callback(eRow);
        });
    }

    private getInitialRowClasses(): string[] {
        let classes: string[] = [];

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

    private createTemplate(cols: Column[]): {rowTemplate: string, newCellComps: SlickCellComp[]} {
        let templateParts: string[] = [];

        let rowHeight = this.rowNode.rowHeight;
        let rowClasses = this.getInitialRowClasses().join(' ');
        let setRowTop = !this.beans.gridOptionsWrapper.isForPrint() && !this.beans.gridOptionsWrapper.isAutoHeight();

        // if sliding in, we take the old row top. otherwise we just set the current row top.
        let rowTop = this.slideRowIn ? this.roundRowTopToBounds(this.rowNode.oldRowTop) : this.rowNode.rowTop;

        templateParts.push(`<div `);
        templateParts.push(  `role="row" `);
        templateParts.push(  `index="${this.rowNode.getRowIndexString()}" `);
        templateParts.push(  `rowId="${this.rowNode.id}" `);
        templateParts.push(  `class="${rowClasses}" `);
        templateParts.push(  `style=" `);
        templateParts.push(    `height: ${rowHeight}px; `);
        templateParts.push(setRowTop ? `top: ${rowTop}px; ` : ``);
        templateParts.push(  `">`);

        // add in the template for the cells
        let cellRes = this.createCellTemplates(cols);
        templateParts.push(cellRes.cellsTemplate);

        templateParts.push(`</div>`);

        let res = {
            rowTemplate: templateParts.join(''),
            newCellComps: cellRes.newCellComps
        };

        return res;
    }

    private createCellTemplates(cols: Column[]): {cellsTemplate: string, newCellComps: SlickCellComp[]} {
        let templateParts: string[] = [];
        let newCellComps: SlickCellComp[] = [];
        cols.forEach( col => {
            let newCellComp = new SlickCellComp(this.beans, col, this.rowNode, this);
            let cellTemplate = newCellComp.getCreateTemplate();
            templateParts.push(cellTemplate);
            newCellComps.push(newCellComp);
            this.slickCellComps[col.getId()] = newCellComp;
        });
        let res = {
            cellsTemplate: templateParts.join(''),
            newCellComps: newCellComps
        };
        return res;
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

        this.delayedDestroyFunctions.push( ()=> {
            rowContainerComp.removeRowElement(eRow);
        });
        this.startRemoveAnimationFunctions.push( ()=> {
            _.addCssClass(eRow, 'ag-opacity-zero');
            if (_.exists(this.rowNode.rowTop)) {
                let rowTop = this.roundRowTopToBounds(this.rowNode.rowTop);
                this.setRowTop(rowTop);
            }
        });

        this.eAllRowContainers.push(eRow);
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

    public destroy(animate = false): void {
        super.destroy();

        this.active = false;

        // why do we have this method? shouldn't everything below be added as a destroy func beside
        // the corresponding create logic?

        // fixme
        // this.destroyScope();
        // this.destroyFullWidthComponent();

        if (animate) {
            this.startRemoveAnimationFunctions.forEach( func => func() );

            this.delayedDestroyFunctions.push( ()=> {
                this.forEachCellComp(renderedCell => renderedCell.destroy(false) );
            });

        } else {
            this.forEachCellComp(renderedCell => renderedCell.destroy(false) );

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

    // we clear so that the functions are never executed twice
    public getAndClearDelayedDestroyFunctions(): Function[] {
        let result = this.delayedDestroyFunctions;
        this.delayedDestroyFunctions = [];
        return result;
    }

    private onCellFocusChanged(): void {
        this.updateCellFocus();
    }

    private updateCellFocus(): void {
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
        // it is possible this row is in the new page, but the page number has changed, which means
        // it needs to reposition itself relative to the new page
        this.onTopChanged();
    }

    private onTopChanged(): void {
        // top is not used in forPrint, as the rows are just laid out naturally
        let doNotSetRowTop = this.beans.gridOptionsWrapper.isForPrint() || this.beans.gridOptionsWrapper.isAutoHeight();
        if (doNotSetRowTop) { return; }

        // console.log(`top changed for ${this.rowNode.id} = ${this.rowNode.rowTop}`);
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
        let result = this.nextVmTurnFunctions;
        this.nextVmTurnFunctions = [];
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
    public getBodyRowElement(): HTMLElement { return null; }
    public getPinnedLeftRowElement(): HTMLElement { return null; }
    public getPinnedRightRowElement(): HTMLElement { return null; }
    public getFullWidthRowElement(): HTMLElement { return null; }

}