import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";
import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";
import { addCssClass, setDomChildOrder } from "../../utils/dom";
import { escapeString } from "../../utils/string";
import { RowController } from "./rowController";
import { exists, missing } from "../../utils/generic";
import { Column } from "../../entities/column";
import { CellComp } from "../cellComp";
import { iterateObject } from "../../utils/object";

export class RowComp extends Component {

    private container: RowContainerComp;

    private fullWidthRowComponent: ICellRendererComp | null | undefined;

    private beans: Beans;
    private pinned: string | null;

    private rowNode: RowNode;

    private controller: RowController;

    private cellComps: { [key: string]: CellComp | null; } = {};

    constructor(controller: RowController, container: RowContainerComp, beans: Beans, rowNode: RowNode, pinned: string | null) {
        super();

        this.container = container;
        this.beans = beans;
        this.rowNode = rowNode;
        this.pinned = pinned;
        this.controller = controller;

        const template = this.createTemplate();
        this.setTemplate(template);
        container.appendRow(this.getGui());

        this.afterRowAttached();
    }

    public onColumnChanged(): void {
        const cols = this.controller.getColsForRowComp(this.pinned);
        const cellsToRemove = Object.assign({}, this.cellComps);

        cols.forEach(col => {
            const colId = col.getId();
            let existingCellComp = this.cellComps[colId];

            // it's possible there is a Cell Comp with correct Id, but it's referring to
            // a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg  pivot_0, pivot_1 etc
            if (existingCellComp && existingCellComp.getColumn()!==col) {
                this.destroyCells([existingCellComp]);
                existingCellComp = null;
            }

            if (existingCellComp == null ) {
                this.newCellComp(col);
            } else {
                cellsToRemove[colId] = null;
            }
        });

        const cellCompsToRemove = Object.values(cellsToRemove)
            .filter( cellComp => cellComp ? this.isCellEligibleToBeRemoved(cellComp) : false );

        this.destroyCells(cellCompsToRemove as CellComp[]);

        this.ensureDomOrder(cols);
    }

    private ensureDomOrder(cols: Column[]): void {
        if (!this.beans.gridOptionsWrapper.isEnsureDomOrder()) { return; }

        const elementsInOrder: HTMLElement[] = [];
        cols.forEach( col => {
            const cellComp = this.cellComps[col.getColId()];
            if (cellComp) {
                elementsInOrder.push(cellComp.getGui());
            }
        });

        setDomChildOrder(this.getGui(), elementsInOrder);
    }

    private isCellEligibleToBeRemoved(cellComp: CellComp): boolean {

        const REMOVE_CELL = true;
        const KEEP_CELL = false;

        // always remove the cell if it's not rendered or if it's in the wrong pinned location
        const column = cellComp.getColumn();
        if (column.getPinned() != this.pinned) { return REMOVE_CELL; }

        // we want to try and keep editing and focused cells
        const editing = cellComp.isEditing();
        const focused = this.beans.focusController.isCellFocused(cellComp.getCellPosition());

        const mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            const column = cellComp.getColumn();
            const displayedColumns = this.beans.columnController.getAllDisplayedColumns();
            const cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;
    }

    private newCellComp(col: Column): void {
        const cellComp = new CellComp(this.controller.getScope(), this.beans, col, this.rowNode, this.controller,
            false, this.controller.isPrintLayout(), this.getGui(), this.controller.isEditing());
        this.cellComps[col.getId()] = cellComp;
        this.getGui().appendChild(cellComp.getGui());
    }

    public getCellComp(id: string): CellComp | null {
        return this.cellComps[id];
    }

    public getCellCompSpanned(column: Column): CellComp | null {
        const spanList = Object.keys(this.cellComps)
            .map(name => this.cellComps[name])
            .filter(cmp => cmp && cmp.getColSpanningList().indexOf(column) !== -1);
        return spanList.length ? spanList[0] : null;
    }

    public destroy(): void {
        super.destroy();
        this.container.removeRow(this.getGui());
        this.destroyAllCells();
    }

    private destroyAllCells(): void {
        const cellsToDestroy = Object.values(this.cellComps).filter(cp => cp!=null);
        this.destroyCells(cellsToDestroy as CellComp[]);
    }

    public getContainer(): RowContainerComp {
        return this.container;
    }

    public setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp): void {
        this.fullWidthRowComponent = fullWidthRowComponent;
    }

    public getFullWidthRowComp(): ICellRendererComp | null | undefined {
        return this.fullWidthRowComponent;
    }

    public destroyFullWidthComponent(): void {
        if (this.fullWidthRowComponent) {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, this.pinned, this.fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        }
    }

    private createTemplate(): string {
        const con = this.controller;

        const templateParts: string[] = [];
        const rowHeight = this.rowNode.rowHeight;
        const rowClasses = con.getInitialRowClasses(this.pinned).join(' ');
        const rowIdSanitised = escapeString(this.rowNode.id!);
        const userRowStyles = con.preProcessStylesFromGridOptions();
        const businessKey = con.getRowBusinessKey();
        const businessKeySanitised = escapeString(businessKey!);
        const rowTopStyle = con.getInitialRowTopStyle();
        const rowIdx = this.rowNode.getRowIndexString();
        const headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();

        templateParts.push(`<div`);
        templateParts.push(` role="row"`);
        templateParts.push(` row-index="${rowIdx}" aria-rowindex="${headerRowCount + this.rowNode.rowIndex! + 1}"`);
        templateParts.push(rowIdSanitised ? ` row-id="${rowIdSanitised}"` : ``);
        templateParts.push(businessKey ? ` row-business-key="${businessKeySanitised}"` : ``);
        templateParts.push(` comp-id="${this.getCompId()}"`);
        templateParts.push(` class="${rowClasses}"`);

        if (con.isFullWidth()) {
            templateParts.push(` tabindex="-1"`);
        }

        if (this.beans.gridOptionsWrapper.isRowSelection()) {
            templateParts.push(` aria-selected="${this.rowNode.isSelected() ? 'true' : 'false'}"`);
        }

        if (this.rowNode.group) {
            templateParts.push(` aria-expanded=${this.rowNode.expanded ? 'true' : 'false'}`);
        }

        templateParts.push(` style="height: ${rowHeight}px; ${rowTopStyle} ${userRowStyles}">`);

        // add in the template for the cells
        templateParts.push(`</div>`);

        return templateParts.join('');
    }

    private afterRowAttached(): void {

        this.addDomData();

        const eRow = this.getGui();

        // adding hover functionality adds listener to this row, so we
        // do it lazily in an animation frame
        if (this.controller.isUseAnimationFrameForCreate()) {
            this.beans.taskQueue.createTask(
                this.controller.addHoverFunctionality.bind(this.controller, eRow),
                this.rowNode.rowIndex!,
                'createTasksP2'
            );
        } else {
            this.controller.addHoverFunctionality(eRow);
        }

        this.controller.executeProcessRowPostCreateFunc();
    }

    private addDomData(): void {
        const gow = this.beans.gridOptionsWrapper;
        gow.setDomData(this.getGui(), RowController.DOM_DATA_KEY_RENDERED_ROW, this.controller);
        this.addDestroyFunc(
            () => gow.setDomData(this.getGui(), RowController.DOM_DATA_KEY_RENDERED_ROW, null)
        );
    }

    public destroyCells(cellComps: CellComp[]): void {
        cellComps.forEach( cellComp => {

            // could be old reference, ie removed cell
            if (!cellComp) { return; }

            // check cellComp belongs in this container
            const id = cellComp.getColumn().getId();
            if (this.cellComps[id]!==cellComp) {return; }

            cellComp.detach();
            cellComp.destroy();
            this.cellComps[id] = null;
        });
    }

    public forEachCellComp(callback: (renderedCell: CellComp) => void): void {
        iterateObject(this.cellComps, (key: any, cellComp: CellComp) => {
            if (!cellComp) { return; }
            callback(cellComp);
        });
    }
}
