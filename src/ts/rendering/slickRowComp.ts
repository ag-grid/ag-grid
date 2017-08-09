
import {Component} from "../widgets/component";
import {IRowComp, LastPlacedElements} from "./rowComp";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Beans} from "./beans";
import {RowContainerComponent} from "./rowContainerComponent";
import {_} from "../utils";
import {Events} from "../events";
import {SlickCellComp} from "./slickCellComp";
import {CellComp} from "./cellComp";
import {Constants} from "../constants";
import {SetLeftFeature} from "./features/setLeftFeature";

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
        requestAnimationFrame(this.setupRow.bind(this));
    }

    private setupRow(): void {
        if (!this.active) { return; }

        this.eBodyRow = this.createRowContainer(this.bodyContainerComp);
        this.ePinnedRightRow = this.createRowContainer(this.pinnedRightContainerComp);
        this.ePinnedLeftRow = this.createRowContainer(this.pinnedLeftContainerComp);

        let rowIsEven = this.rowNode.rowIndex % 2 === 0;
        let oddOrEvenClass = rowIsEven ? 'ag-row-odd' : 'ag-row-even';
        let allCssClasses = 'ag-row ' + oddOrEvenClass;

        this.eAllRowContainers.forEach( eRowContainer => _.addCssClass(eRowContainer, allCssClasses));
        this.setupTop();
        this.setHeight();

        this.refreshCells();

        this.addColumnListener();
    }

    private addColumnListener(): void {
        let eventService = this.beans.eventService;
        this.addDestroyableEventListener(eventService, Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_VIRTUAL_COLUMNS_CHANGED, this.refreshCells.bind(this));
        this.addDestroyableEventListener(eventService, Events.EVENT_COLUMN_RESIZED, this.refreshCells.bind(this));

        // fixme - for this we should be clearing out everything, should inherit this from super component
        this.addDestroyableEventListener(eventService, Events.EVENT_GRID_COLUMNS_CHANGED, this.refreshCells.bind(this));
    }

    public getElementForCell(column: Column): HTMLElement {

        let eFirstToTry: HTMLElement;

        switch (column.getPinned()) {
            case Column.PINNED_LEFT:
                eFirstToTry = this.ePinnedLeftRow;
                break;
            case Column.PINNED_RIGHT:
                eFirstToTry = this.ePinnedRightRow;
                break;
            default:
                eFirstToTry = this.eBodyRow;
                break;
        }

        let querySelector = `[colid="${column.getId()}"]`;
        let result = <HTMLElement> eFirstToTry.querySelector(querySelector);

        if (!result) {
            this.eAllRowContainers.forEach( eContainer => {
                let tryThisContainer = !result && eContainer !== eFirstToTry;
                if (tryThisContainer) {
                    result = <HTMLElement> eContainer.querySelector(querySelector);
                }
            });
        }

        return result;
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

        cols.forEach( col => {

            let colId = col.getId();
            let oldCell = this.slickCellComps[colId];

            if (oldCell) {
                this.ensureCellInCorrectContainer(oldCell);
            } else {
                this.createNewCell(col, eContainer, cellTemplates);
            }

        });

        if (cellTemplates.length>0) {
            if (eContainer.lastChild) {
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
                eContainer.insertAdjacentHTML('beforeend', cellTemplates.join(''));
            } else {
                eContainer.innerHTML = cellTemplates.join('');
            }
        }
    }

    private createNewCell(col: Column, eContainer: HTMLElement, cellTemplates: string[]): void {
        let cellTemplate = this.createTemplateForCell(col);
        cellTemplates.push(cellTemplate);
        let slickCellComp = new SlickCellComp(this.beans, col, this.rowNode, this);
        this.slickCellComps[col.getId()] = slickCellComp;
        slickCellComp.setParentRow(eContainer);
    }

    private createTemplateForCell(col: Column): string {
        let template: string[] = [];

        let width = col.getActualWidth();
        let left = col.getLeft();
        let value = this.getValue(col);
        let valueFormatted = this.beans.valueFormatterService.formatValue(col, this.rowNode, null, value);
        let valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
        let valueToRender = valueFormattedExits ? valueFormatted : value;

        let cssClasses: string[] = ["ag-cell", "ag-cell-value", "ag-cell-no-focus", "ag-cell-not-inline-editing"];
        _.pushAll(cssClasses, this.getClassesFromColDef(col, value));
        _.pushAll(cssClasses, this.getClassesFromRules(col, value));

        template.push(`<div`);
        template.push(` role="gridcell"`);
        template.push(` colid="${col.getId()}"`);
        template.push(` class="${cssClasses.join(' ')}"`);
        template.push(` style="width: ${width}px; left: ${left}px;" >`);
        template.push(valueToRender);
        template.push(`</div>`);

        return template.join('');
    }

    private getClassesFromColDef(column: Column, value: any): string[] {

        let res: string[] = [];

        this.beans.stylingService.processStaticCellClasses(
            column.getColDef(),
            {
                value: value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: column.getColDef(),
                rowIndex: this.rowNode.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            },
            (className:string)=>{
                res.push(className);
            }
        );

        return res;
    }

    private getClassesFromRules(column: Column, value: any): string[] {

        let res: string[] = [];

        this.beans.stylingService.processCellClassRules(
            column.getColDef(),
            {
                value: value,
                data: this.rowNode.data,
                node: this.rowNode,
                colDef: column.getColDef(),
                rowIndex: this.rowNode.rowIndex,
                api: this.beans.gridOptionsWrapper.getApi(),
                context: this.beans.gridOptionsWrapper.getContext()
            },
            (className:string)=>{
                res.push(className);
            },
            (className:string)=>{
                // not catered for
            }
        );

        return res;
    }

    private getValue(column: Column): any {
        let isOpenGroup = this.rowNode.group && this.rowNode.expanded && !this.rowNode.footer;
        if (isOpenGroup && this.beans.gridOptionsWrapper.isGroupIncludeFooter()) {
            // if doing grouping and footers, we don't want to include the agg value
            // in the header when the group is open
            return this.beans.valueService.getValue(column, this.rowNode, true);
        } else {
            return this.beans.valueService.getValue(column, this.rowNode);
        }
    }

    private createRowContainer(rowContainerComp: RowContainerComponent): HTMLElement {
        let eRow = document.createElement('div');
        eRow.setAttribute('role', 'row');

        // this.addDomData(eRow);

        rowContainerComp.appendRowElement(eRow, null, false);

        this.addDestroyFunc(rowContainerComp.removeRowElement.bind(rowContainerComp, eRow));

        this.eAllRowContainers.push(eRow);

        return eRow;
    }

    private setupTop(): void {
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

    private setHeight(): void {
        let setHeightListener = () => {
            // check for exists first - if the user is resetting the row height, then
            // it will be null (or undefined) momentarily until the next time the flatten
            // stage is called where the row will then update again with a new height
            if (_.exists(this.rowNode.rowHeight)) {
                let heightPx = this.rowNode.rowHeight + 'px';
                this.eAllRowContainers.forEach( row => row.style.height = heightPx);
            }
        };

        this.addDestroyableEventListener(this.rowNode, RowNode.EVENT_HEIGHT_CHANGED, setHeightListener);

        setHeightListener();
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