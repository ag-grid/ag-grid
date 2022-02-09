import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";
import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";
import { setDomChildOrder } from "../../utils/dom";
import {escapeString, stringOrNull} from "../../utils/string";
import { FullWidthKeys, FullWidthRenderers, RowController, RowType } from "./rowController";
import { Column } from "../../entities/column";
import { CellComp } from "../cellComp";
import { assign, getAllValuesInObject, iterateObject } from "../../utils/object";
import { Constants } from "../../constants/constants";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { ModuleNames } from "../../modules/moduleNames";

export class RowComp extends Component {

    private container: RowContainerComp;
    private fullWidthRowComponent: ICellRendererComp | null | undefined;

    private beans: Beans;
    private pinned: string | null;

    private rowNode: RowNode;
    private controller: RowController;

    private cellComps: { [key: string]: CellComp | null; } = {};

    constructor(controller: RowController, container: RowContainerComp, beans: Beans, pinned: string | null) {
        super();

        this.container = container;
        this.beans = beans;
        this.rowNode = controller.getRowNode();
        this.pinned = pinned;
        this.controller = controller;

        this.setElement(this.createElement());

        this.afterRowAttached();

        switch (pinned) {
            case Constants.PINNED_LEFT:
                controller.setLeftRowComp(this);
                break;
            case Constants.PINNED_RIGHT:
                controller.setRightRowComp(this);
                break;
            default:
                if (controller.isFullWidth() && !beans.gridOptionsWrapper.isEmbedFullWidthRows()) {
                    controller.setFullWidthRowComp(this);
                } else {
                    controller.setCenterRowComp(this);
                }
                break;
        }

        if (controller.isFullWidth()) {
            this.createFullWidthRowCell();
        } else {
            this.onColumnChanged();
            this.controller.refreshAriaLabel(this.getGui(), !!this.rowNode.isSelected());
        }
    }

    private createFullWidthRowCell(): void {
        const params = this.controller.createFullWidthParams(this.getGui(), this.pinned);

        const callback = (cellRenderer: ICellRendererComp) => {
            if (this.isAlive()) {
                const eGui = cellRenderer.getGui();
                this.getGui().appendChild(eGui);
                if (this.controller.getRowType() === RowType.FullWidthDetail) {
                    this.controller.setupDetailRowAutoHeight(eGui);
                }
                this.setFullWidthRowComp(cellRenderer);
            } else {
                this.beans.context.destroyBean(cellRenderer);
            }
        };

        // if doing master detail, it's possible we have a cached row comp from last time detail was displayed
        const cachedDetailComp = this.beans.detailRowCompCache.get(this.rowNode, this.pinned);
        if (cachedDetailComp) {
            callback(cachedDetailComp);
        } else {
            const cellRendererType = FullWidthKeys.get(this.controller.getRowType())!;
            const cellRendererName = FullWidthRenderers.get(this.controller.getRowType())!;

            const res = this.beans.userComponentFactory.newFullWidthCellRenderer(
                params,
                cellRendererType,
                cellRendererName
            );

            if (res) {
                res.then(callback);
            } else {
                const masterDetailModuleLoaded = ModuleRegistry.isRegistered(ModuleNames.MasterDetailModule);
                if (cellRendererName === 'agDetailCellRenderer' && !masterDetailModuleLoaded) {
                    console.warn(`AG Grid: cell renderer agDetailCellRenderer (for master detail) not found. Did you forget to include the master detail module?`);
                } else {
                    console.error(`AG Grid: fullWidthCellRenderer ${cellRendererName} not found`);
                }
            }
        }

        // fixme - what to do here?
        // this.angular1Compile(eRow);
    }

    public onColumnChanged(): void {
        const cols = this.controller.getColsForRowComp(this.pinned);
        const cellsToRemove = assign({}, this.cellComps);

        cols.forEach(col => {
            const colId = col.getId();
            let existingCellComp = this.cellComps[colId];

            // it's possible there is a Cell Comp with correct Id, but it's referring to
            // a different column instance. Happens a lot with pivot, as pivot col id's are
            // reused eg  pivot_0, pivot_1 etc
            if (existingCellComp && existingCellComp.getColumn() !== col) {
                this.destroyCells([existingCellComp]);
                existingCellComp = null;
            }

            if (existingCellComp == null) {
                this.newCellComp(col);
            } else {
                cellsToRemove[colId] = null;
            }
        });

        const cellCompsToRemove = getAllValuesInObject(cellsToRemove)
            .filter(cellComp => cellComp ? this.isCellEligibleToBeRemoved(cellComp) : false);

        this.destroyCells(cellCompsToRemove as CellComp[]);
        this.ensureDomOrder(cols);
    }

    private ensureDomOrder(cols: Column[]): void {
        if (!this.beans.gridOptionsWrapper.isEnsureDomOrder()) { return; }

        const elementsInOrder: HTMLElement[] = [];
        cols.forEach(col => {
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
        this.destroyAllCells();
    }

    private destroyAllCells(): void {
        const cellsToDestroy = getAllValuesInObject(this.cellComps).filter(cp => cp != null);
        this.destroyCells(cellsToDestroy as CellComp[]);
    }

    public getContainer(): RowContainerComp {
        return this.container;
    }

    public setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp): void {
        if (this.fullWidthRowComponent) {
            console.error('AG Grid - should not be setting fullWidthRowComponent twice');
        }

        this.fullWidthRowComponent = fullWidthRowComponent;
        this.addDestroyFunc(() => {
            this.beans.detailRowCompCache.addOrDestroy(this.rowNode, this.pinned, fullWidthRowComponent);
            this.fullWidthRowComponent = null;
        });
    }

    public getFullWidthRowComp(): ICellRendererComp | null | undefined {
        return this.fullWidthRowComponent;
    }

    private createElement() {
      var con = this.controller;
      var templateParts = [];
      var rowHeight = this.rowNode.rowHeight;
      var rowClasses = con.getInitialRowClasses(this.pinned).join(' ');
      var rowIdSanitised = stringOrNull(this.rowNode.id!);
      var userRowStyles = con.preProcessStylesFromGridOptions();
      var businessKey = stringOrNull(con.getRowBusinessKey()!);
      var rowTopStyle = con.getInitialRowTopStyle();
      var rowIdx = this.rowNode.getRowIndexString();
      var headerRowCount = this.beans.headerNavigationService.getHeaderRowCount();
      var el = document.createElement('div');
      el.setAttribute('role', 'row');
      el.setAttribute('row-index', rowIdx);
      el.setAttribute('aria-rowindex', (headerRowCount + this.rowNode.rowIndex! + 1) as unknown as string);
      if (rowIdSanitised) {
        el.setAttribute('row-id', rowIdSanitised);
      }
      if (businessKey) {
        el.setAttribute('row-business-key', businessKey);
      }
      el.setAttribute('comp-id', this.getCompId() as unknown as string);
      el.className = rowClasses;
      if (con.isFullWidth()) {
        el.setAttribute('tabindex', "-1");
      }
      if (this.beans.gridOptionsWrapper.isRowSelection()) {
        el.setAttribute('aria-selected', this.rowNode.isSelected() ? 'true' : 'false');
      }
      if (this.rowNode.group) {
        el.setAttribute('aria-expanded', this.rowNode.expanded ? 'true' : 'false');
      }
      el.setAttribute('style', "height: " + rowHeight + "px; " + rowTopStyle + " " + userRowStyles);
      return el;
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
        cellComps.forEach(cellComp => {

            // could be old reference, ie removed cell
            if (!cellComp) { return; }

            // check cellComp belongs in this container
            const id = cellComp.getColumn().getId();
            if (this.cellComps[id] !== cellComp) {return; }

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
