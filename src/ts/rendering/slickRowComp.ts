
import {Component} from "../widgets/component";
import {IRowComp, LastPlacedElements, RowComp} from "./rowComp";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Beans} from "./beans";
import {RowContainerComponent} from "./rowContainerComponent";
import {_} from "../utils";
import {Events, RowClickedEvent, RowDoubleClickedEvent, RowEvent} from "../events";
import {SlickCellComp} from "./slickCellComp";
import {CellComp} from "./cellComp";

export class SlickRowComp extends Component implements IRowComp {

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

    private slickCellComps: {[key: string]: SlickCellComp} = {};

    constructor(bodyContainerComp: RowContainerComponent,
                pinnedLeftContainerComp: RowContainerComponent,
                pinnedRightContainerComp: RowContainerComponent,
                rowNode: RowNode,
                beans: Beans) {
        super();
        this.beans = beans;
        this.bodyContainerComp = bodyContainerComp;
        this.pinnedLeftContainerComp = pinnedLeftContainerComp;
        this.pinnedRightContainerComp = pinnedRightContainerComp;
        this.rowNode = rowNode;
    }

    public isEditing(): boolean {
        return false;
    }

    public init(): void {
        let centerCols = this.beans.columnController.getAllDisplayedCenterVirtualColumnsForRow(this.rowNode);
        let leftCols = this.beans.columnController.getDisplayedLeftColumnsForRow(this.rowNode);
        let rightCols = this.beans.columnController.getDisplayedRightColumnsForRow(this.rowNode);

        this.createRowContainer(this.bodyContainerComp, centerCols, eRow => this.eBodyRow = eRow);
        this.createRowContainer(this.pinnedRightContainerComp, rightCols, eRow => this.ePinnedRightRow = eRow);
        this.createRowContainer(this.pinnedLeftContainerComp, leftCols, eRow => this.ePinnedLeftRow = eRow);

        this.addListeners();
    }

    private addListeners(): void {
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, this.onRowHeightChanged.bind(this));
        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));

        let eventService = this.beans.eventService;
        this.addDestroyableEventListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_COLUMN_RESIZED, this.refreshCells.bind(this));

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

    private createRowContainer(rowContainerComp: RowContainerComponent, cols: Column[], callback: (eRow: HTMLElement)=>void): void {
        let res = this.createTemplate(cols);
        rowContainerComp.appendRowTemplateAsync(res.rowTemplate, ()=> {
            let eRow: HTMLElement = rowContainerComp.getRowElement(this.rowNode.id);
            this.afterRowAttached(rowContainerComp, res.newCellComps, eRow);
            callback(eRow);
        });
    }

    private getInitialRowClasses(): string[] {
        let classes: string[] = [];

        classes.push('ag-row');
        classes.push('ag-row-no-focus');

        if (this.rowNode.rowIndex % 2 === 0) {
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

    private createTemplate(cols: Column[]): {rowTemplate: string, newCellComps: SlickCellComp[]} {
        let templateParts: string[] = [];

        let rowHeight = this.rowNode.rowHeight;
        let rowClasses = this.getInitialRowClasses().join(' ');
        let setRowTop = !this.beans.gridOptionsWrapper.isForPrint() && !this.beans.gridOptionsWrapper.isAutoHeight();
        let rowTop = this.getRowTop();

        templateParts.push(`<div `);
        templateParts.push(  `role="row" `);
        templateParts.push(  `row="${this.rowNode.id}" `);
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

        this.addDestroyFunc(()=> {
            rowContainerComp.removeRowElement(eRow);
        });

        this.eAllRowContainers.push(eRow);
    }

    private getRowTop(): number {

        let pixels = this.rowNode.rowTop;

        // need to make sure rowTop is not null, as this can happen if the node was once
        // visible (ie parent group was expanded) but is now not visible
        let pixelsWithOffset: number;
        if (this.rowNode.isRowPinned()) {
            pixelsWithOffset = pixels;
        } else {
            pixelsWithOffset = pixels - this.beans.paginationProxy.getPixelOffset();
        }

        return pixelsWithOffset;
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
        console.warn('ag-Grid: adding events to rows not allowed for SlickRendering');
    }

    public destroy(): void {
        super.destroy();
        this.active = false;
    }

    public getRowNode(): RowNode {
        return this.rowNode;
    }

    public getRenderedCellForColumn(column: Column): CellComp {
        return null;
    }

    public ensureInDomAfter(previousElement: LastPlacedElements): void {}
    public getAndClearNextVMTurnFunctions(): Function[] { return [];}
    public getBodyRowElement(): HTMLElement { return null; }
    public getPinnedLeftRowElement(): HTMLElement { return null; }
    public getPinnedRightRowElement(): HTMLElement { return null; }
    public getFullWidthRowElement(): HTMLElement { return null; }

}