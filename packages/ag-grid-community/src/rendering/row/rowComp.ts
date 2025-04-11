import type { BeanCollection } from '../../context/context';
import type { RowStyle } from '../../entities/gridOptions';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _addStylesToElement, _createElement, _setDomChildOrder } from '../../utils/dom';
import { Component } from '../../widgets/component';
import { CellComp } from '../cell/cellComp';
import type { CellCtrl, CellCtrlInstanceId } from '../cell/cellCtrl';
import type { ICellRendererComp } from '../cellRenderers/iCellRenderer';
import type { IRowComp, RowCtrl } from './rowCtrl';

export class RowComp extends Component {
    private fullWidthCellRenderer: ICellRendererComp | null | undefined;

    private rowCtrl: RowCtrl;

    private domOrder: boolean;
    private cellComps: Map<CellCtrlInstanceId, CellComp | null> = new Map();

    constructor(ctrl: RowCtrl, beans: BeanCollection, containerType: RowContainerType) {
        super();

        this.beans = beans;
        this.rowCtrl = ctrl;

        const rowDiv = _createElement({ tag: 'div', role: 'row', attrs: { 'comp-id': `${this.getCompId()}` } });
        this.setInitialStyle(rowDiv, containerType);
        this.setTemplateFromElement(rowDiv);

        const style = rowDiv.style;
        this.domOrder = this.rowCtrl.getDomOrder();

        const compProxy: IRowComp = {
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
            setCellCtrls: (cellCtrls) => this.setCellCtrls(cellCtrls),
            showFullWidth: (compDetails) => this.showFullWidth(compDetails),
            getFullWidthCellRenderer: () => this.fullWidthCellRenderer,
            toggleCss: (name, on) => this.toggleCss(name, on),
            setUserStyles: (styles: RowStyle | undefined) => _addStylesToElement(rowDiv, styles),
            setTop: (top) => (style.top = top),
            setTransform: (transform) => (style.transform = transform),
            setRowIndex: (rowIndex) => rowDiv.setAttribute('row-index', rowIndex),
            setRowId: (rowId: string) => rowDiv.setAttribute('row-id', rowId),
            setRowBusinessKey: (businessKey) => rowDiv.setAttribute('row-business-key', businessKey),
            refreshFullWidth: (getUpdatedParams) => this.fullWidthCellRenderer?.refresh?.(getUpdatedParams()) ?? false,
        };

        ctrl.setComp(compProxy, this.getGui(), containerType, undefined);
        this.addDestroyFunc(() => {
            ctrl.unsetComp(containerType);
        });
    }

    private setInitialStyle(container: HTMLElement, containerType: RowContainerType): void {
        const transform = this.rowCtrl.getInitialTransform(containerType);

        if (transform) {
            container.style.setProperty('transform', transform);
        } else {
            const top = this.rowCtrl.getInitialRowTop(containerType);
            if (top) {
                container.style.setProperty('top', top);
            }
        }
    }

    private showFullWidth(compDetails: UserCompDetails): void {
        const callback = (cellRenderer: ICellRendererComp) => {
            if (this.isAlive()) {
                const eGui = cellRenderer.getGui();
                this.getGui().appendChild(eGui);
                this.rowCtrl.setupDetailRowAutoHeight(eGui);
                this.setFullWidthRowComp(cellRenderer);
            } else {
                this.beans.context.destroyBean(cellRenderer);
            }
        };

        // if not in cache, create new one
        const res = compDetails.newAgStackInstance();

        res.then(callback);
    }

    private setCellCtrls(cellCtrls: CellCtrl[]): void {
        const cellsToRemove = new Map(this.cellComps);

        for (const cellCtrl of cellCtrls) {
            const key = cellCtrl.instanceId;

            if (!this.cellComps.has(key)) {
                this.newCellComp(cellCtrl);
            } else {
                cellsToRemove.delete(key);
            }
        }

        this.destroyCells(cellsToRemove);
        this.ensureDomOrder(cellCtrls);
    }

    private ensureDomOrder(cellCtrls: CellCtrl[]): void {
        if (!this.domOrder) {
            return;
        }

        const elementsInOrder: HTMLElement[] = [];
        for (const cellCtrl of cellCtrls) {
            const cellComp = this.cellComps.get(cellCtrl.instanceId);
            if (cellComp) {
                elementsInOrder.push(cellComp.getGui());
            }
        }

        _setDomChildOrder(this.getGui(), elementsInOrder);
    }

    private newCellComp(cellCtrl: CellCtrl): void {
        const cellComp = new CellComp(
            this.beans,
            cellCtrl,
            this.rowCtrl.printLayout,
            this.getGui(),
            this.rowCtrl.editing
        );
        this.cellComps.set(cellCtrl.instanceId, cellComp);
        this.getGui().appendChild(cellComp.getGui());
    }

    public override destroy(): void {
        super.destroy();
        // Destroy all cells
        this.destroyCells(this.cellComps);
    }

    private setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp): void {
        this.fullWidthCellRenderer = fullWidthRowComponent;
        this.addDestroyFunc(() => {
            this.fullWidthCellRenderer = this.beans.context.destroyBean(this.fullWidthCellRenderer);
        });
    }

    private destroyCells(cellComps: Map<CellCtrlInstanceId, CellComp | null>): void {
        for (const cellComp of cellComps.values()) {
            // could be old reference, ie removed cell
            if (!cellComp) {
                return;
            }

            // check cellComp belongs in this container
            const instanceId = cellComp.cellCtrl.instanceId;
            if (this.cellComps.get(instanceId) !== cellComp) {
                return;
            }

            cellComp.detach();
            cellComp.destroy();
            this.cellComps.delete(instanceId);
        }
    }
}
