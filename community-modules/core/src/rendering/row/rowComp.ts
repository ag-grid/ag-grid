import type { UserCompDetails } from '../../components/framework/userComponentFactory';
import type { BeanCollection } from '../../context/context';
import type { RowStyle } from '../../entities/gridOptions';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import { _setAriaRole } from '../../utils/aria';
import { _addStylesToElement, _setDomChildOrder } from '../../utils/dom';
import { _errorOnce } from '../../utils/function';
import { _getAllValuesInObject } from '../../utils/object';
import { Component } from '../../widgets/component';
import { CellComp } from '../cell/cellComp';
import type { CellCtrl, CellCtrlInstanceId } from '../cell/cellCtrl';
import type { ICellRendererComp, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import type { IRowComp, RowCtrl } from './rowCtrl';

export class RowComp extends Component {
    private fullWidthCellRenderer: ICellRendererComp | null | undefined;

    private beans: BeanCollection;

    private rowCtrl: RowCtrl;

    private domOrder: boolean;
    private cellComps: { [key: CellCtrlInstanceId]: CellComp | null } = {};

    constructor(ctrl: RowCtrl, beans: BeanCollection, containerType: RowContainerType) {
        super();

        this.beans = beans;
        this.rowCtrl = ctrl;

        const rowDiv = document.createElement('div');
        rowDiv.setAttribute('comp-id', `${this.getCompId()}`);
        rowDiv.setAttribute('style', this.getInitialStyle(containerType));
        this.setTemplateFromElement(rowDiv);

        const eGui = this.getGui();
        const style = eGui.style;
        this.domOrder = this.rowCtrl.getDomOrder();
        _setAriaRole(eGui, 'row');

        const compProxy: IRowComp = {
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
            setCellCtrls: (cellCtrls) => this.setCellCtrls(cellCtrls),
            showFullWidth: (compDetails) => this.showFullWidth(compDetails),
            getFullWidthCellRenderer: () => this.getFullWidthCellRenderer(),
            addOrRemoveCssClass: (name, on) => this.addOrRemoveCssClass(name, on),
            setUserStyles: (styles: RowStyle | undefined) => _addStylesToElement(eGui, styles),
            setTop: (top) => (style.top = top),
            setTransform: (transform) => (style.transform = transform),
            setRowIndex: (rowIndex) => eGui.setAttribute('row-index', rowIndex),
            setRowId: (rowId: string) => eGui.setAttribute('row-id', rowId),
            setRowBusinessKey: (businessKey) => eGui.setAttribute('row-business-key', businessKey),
            refreshFullWidth: (getUpdatedParams) => this.refreshFullWidth(getUpdatedParams),
        };

        ctrl.setComp(compProxy, this.getGui(), containerType);
        this.addDestroyFunc(() => {
            ctrl.unsetComp(containerType);
        });
    }

    private getInitialStyle(containerType: RowContainerType): string {
        const transform = this.rowCtrl.getInitialTransform(containerType);
        return transform ? `transform: ${transform}` : `top: ${this.rowCtrl.getInitialRowTop(containerType)}`;
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

        if (res == null) {
            return;
        }

        res.then(callback);
    }

    private setCellCtrls(cellCtrls: CellCtrl[]): void {
        const cellsToRemove = Object.assign({}, this.cellComps);

        cellCtrls.forEach((cellCtrl) => {
            const key = cellCtrl.getInstanceId();
            const existingCellComp = this.cellComps[key];

            if (existingCellComp == null) {
                this.newCellComp(cellCtrl);
            } else {
                cellsToRemove[key] = null;
            }
        });

        const cellCompsToRemove = _getAllValuesInObject(cellsToRemove).filter((cellComp) => cellComp != null);

        this.destroyCells(cellCompsToRemove as CellComp[]);
        this.ensureDomOrder(cellCtrls);
    }

    private ensureDomOrder(cellCtrls: CellCtrl[]): void {
        if (!this.domOrder) {
            return;
        }

        const elementsInOrder: HTMLElement[] = [];
        cellCtrls.forEach((cellCtrl) => {
            const cellComp = this.cellComps[cellCtrl.getInstanceId()];
            if (cellComp) {
                elementsInOrder.push(cellComp.getGui());
            }
        });

        _setDomChildOrder(this.getGui(), elementsInOrder);
    }

    private newCellComp(cellCtrl: CellCtrl): void {
        const cellComp = new CellComp(
            this.beans,
            cellCtrl,
            this.rowCtrl.isPrintLayout(),
            this.getGui(),
            this.rowCtrl.isEditing()
        );
        this.cellComps[cellCtrl.getInstanceId()] = cellComp;
        this.getGui().appendChild(cellComp.getGui());
    }

    public override destroy(): void {
        super.destroy();
        this.destroyAllCells();
    }

    private destroyAllCells(): void {
        const cellsToDestroy = _getAllValuesInObject(this.cellComps).filter((cp) => cp != null);
        this.destroyCells(cellsToDestroy as CellComp[]);
    }

    private setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp): void {
        if (this.fullWidthCellRenderer) {
            _errorOnce('should not be setting fullWidthRowComponent twice');
        }

        this.fullWidthCellRenderer = fullWidthRowComponent;
        this.addDestroyFunc(() => {
            this.fullWidthCellRenderer = this.beans.context.destroyBean(this.fullWidthCellRenderer);
        });
    }

    private getFullWidthCellRenderer(): ICellRendererComp | null | undefined {
        return this.fullWidthCellRenderer;
    }

    private destroyCells(cellComps: CellComp[]): void {
        cellComps.forEach((cellComp) => {
            // could be old reference, ie removed cell
            if (!cellComp) {
                return;
            }

            // check cellComp belongs in this container
            const instanceId = cellComp.getCtrl().getInstanceId();
            if (this.cellComps[instanceId] !== cellComp) {
                return;
            }

            cellComp.detach();
            cellComp.destroy();
            this.cellComps[instanceId] = null;
        });
    }

    private refreshFullWidth(getUpdatedParams: () => ICellRendererParams): boolean {
        const { fullWidthCellRenderer } = this;
        if (!fullWidthCellRenderer || !fullWidthCellRenderer.refresh) {
            return false;
        }

        const params = getUpdatedParams();

        return fullWidthCellRenderer.refresh(params);
    }
}
