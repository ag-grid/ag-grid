import { Component } from "../../widgets/component";
import { RowContainerComp } from "../../gridBodyComp/rowContainer/rowContainerComp";
import { ICellRendererComp } from "../cellRenderers/iCellRenderer";
import { Beans } from "../beans";
import { RowNode } from "../../entities/rowNode";
import { addOrRemoveCssClass, addStylesToElement, setDomChildOrder } from "../../utils/dom";
import { escapeString } from "../../utils/string";
import { FullWidthKeys, FullWidthRenderers, IRowComp, RowCtrl, RowType } from "./rowCtrl";
import { Column } from "../../entities/column";
import { CellComp } from "../cellComp";
import { assign, getAllValuesInObject, iterateObject } from "../../utils/object";
import { Constants } from "../../constants/constants";
import { ModuleRegistry } from "../../modules/moduleRegistry";
import { ModuleNames } from "../../modules/moduleNames";
import { setAriaExpanded, setAriaLabel, setAriaRowIndex, setAriaSelected } from "../../utils/aria";

export class RowComp extends Component {

    private container: RowContainerComp;
    private fullWidthRowComponent: ICellRendererComp | null | undefined;

    private beans: Beans;
    private pinned: string | null;

    private rowNode: RowNode;
    private ctrl: RowCtrl;

    private domOrder: boolean;
    private cellComps: { [key: string]: CellComp | null; } = {};

    constructor(controller: RowCtrl, container: RowContainerComp, beans: Beans, pinned: string | null) {
        super();

        this.container = container;
        this.beans = beans;
        this.rowNode = controller.getRowNode();
        this.pinned = pinned;
        this.ctrl = controller;

        this.setTemplate(`<div role="row" comp-id="${this.getCompId()}"/>`);

        const compProxy: IRowComp = {
            setDomOrder: domOrder => this.domOrder = domOrder,
            setColumns: columns => this.setColumns(columns),
            getFullWidthRowComp: ()=> this.getFullWidthRowComp(),
            addOrRemoveCssClass: (name, on) => this.addOrRemoveCssClass(name, on),
            setAriaExpanded: on => setAriaExpanded(this.getGui(), on),
            destroyCells: cellComps => this.destroyCells(cellComps),
            forEachCellComp: callback => this.forEachCellComp(callback),
            setUserStyles: styles => addStylesToElement(this.getGui(), styles),
            setAriaSelected: value => setAriaSelected(this.getGui(), value),
            setAriaLabel: value => {
                if (value==null) {
                    this.getGui().removeAttribute('aria-label');
                } else {
                    this.getGui().setAttribute('aria-label', value)
                }
            },
            setHeight: height => this.getGui().style.height = height,
            destroy: ()=> this.destroy(),
            setTop: top => this.getGui().style.top = top,
            setTransform: transform => this.getGui().style.transform = transform,
            getCellComp: colId => this.getCellComp(colId),
            getAllCellComps: () => Object.keys(this.cellComps).map(k => this.cellComps[k]).filter(c => c!=null) as CellComp[],
            setRowIndex: rowIndex => this.getGui().setAttribute('row-index', rowIndex),
            setAriaRowIndex: rowIndex => setAriaRowIndex(this.getGui(), rowIndex),
            setRowId: (rowId: string) => this.getGui().setAttribute('row-id', rowId),
            setRowBusinessKey: businessKey => this.getGui().setAttribute('row-business-key', businessKey),
            setTabIndex: tabIndex => this.getGui().setAttribute('tabindex', tabIndex.toString())
        };

        controller.setComp(compProxy, this.getGui(), pinned);

        if (controller.isFullWidth()) {
            this.createFullWidthRowCell();
        }
    }

    private createFullWidthRowCell(): void {
        const params = this.ctrl.createFullWidthParams(this.getGui(), this.pinned);

        const callback = (cellRenderer: ICellRendererComp) => {
            if (this.isAlive()) {
                const eGui = cellRenderer.getGui();
                this.getGui().appendChild(eGui);
                if (this.ctrl.getRowType() === RowType.FullWidthDetail) {
                    this.ctrl.setupDetailRowAutoHeight(eGui);
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
            const cellRendererType = FullWidthKeys.get(this.ctrl.getRowType())!;
            const cellRendererName = FullWidthRenderers.get(this.ctrl.getRowType())!;

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
    }

    public setColumns(cols: Column[]): void {
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
        const focused = this.beans.focusService.isCellFocused(cellComp.getCellPosition());

        const mightWantToKeepCell = editing || focused;

        if (mightWantToKeepCell) {
            const column = cellComp.getColumn();
            const displayedColumns = this.beans.columnModel.getAllDisplayedColumns();
            const cellStillDisplayed = displayedColumns.indexOf(column) >= 0;
            return cellStillDisplayed ? KEEP_CELL : REMOVE_CELL;
        }

        return REMOVE_CELL;
    }

    private newCellComp(col: Column): void {
        const cellComp = new CellComp(this.ctrl.getScope(), this.beans, col, this.rowNode, this.ctrl,
            false, this.ctrl.isPrintLayout(), this.getGui(), this.ctrl.isEditing());
        this.cellComps[col.getId()] = cellComp;
        this.getGui().appendChild(cellComp.getGui());
    }

    public getCellComp(id: string): CellComp | null {
        return this.cellComps[id];
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
