import { _addStylesToElement, _setDomChildOrder } from '../../agStack/utils/dom';
import type { BeanCollection } from '../../context/context';
import type { RowStyle } from '../../entities/gridOptions';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _createElement } from '../../utils/element';
import { Component } from '../../widgets/component';
import { CellComp } from '../cell/cellComp';
import type { CellCtrl, CellCtrlInstanceId } from '../cell/cellCtrl';
import type { ICellRendererComp, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import type { IRowComp, RowCtrl } from './rowCtrl';

export class RowComp extends Component {
    private fullWidthCellRenderer: ICellRendererComp | null | undefined;
    private fullWidthCellRendererParams: ICellRendererParams | undefined;

    private readonly rowCtrl: RowCtrl;
    private readonly ePinnedLeftCells: HTMLElement | undefined;
    private readonly eScrollingCells: HTMLElement | undefined;
    private readonly ePinnedRightCells: HTMLElement | undefined;
    private pinnedLeftWidth: number | undefined;
    private centerWidth: number | undefined;
    private pinnedRightWidth: number | undefined;

    private domOrder: boolean;
    private readonly cellComps: Map<CellCtrlInstanceId, CellComp | null> = new Map();

    constructor(ctrl: RowCtrl, beans: BeanCollection, containerType: RowContainerType) {
        super();

        this.beans = beans;
        this.rowCtrl = ctrl;

        const rowDiv = _createElement({ tag: 'div', role: 'row', attrs: { 'comp-id': `${this.getCompId()}` } });
        if (!ctrl.isFullWidth()) {
            this.ePinnedLeftCells = _createElement({
                tag: 'div',
                cls: 'ag-grid-pinned-left-cells',
                role: 'presentation',
            });
            this.eScrollingCells = _createElement({
                tag: 'div',
                cls: 'ag-grid-scrolling-cells',
                role: 'presentation',
            });
            this.ePinnedRightCells = _createElement({
                tag: 'div',
                cls: 'ag-grid-pinned-right-cells',
                role: 'presentation',
            });
            rowDiv.append(this.ePinnedLeftCells, this.eScrollingCells, this.ePinnedRightCells);
        }
        this.setInitialStyle(rowDiv, containerType);
        this.setTemplateFromElement(rowDiv);

        const style = rowDiv.style;
        this.domOrder = this.rowCtrl.getDomOrder();

        const compProxy: IRowComp = {
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
            setCellCtrls: (cellCtrls) => this.setCellCtrls(cellCtrls),
            getPinnedLeftRowElement: () => this.ePinnedLeftCells,
            getPinnedRightRowElement: () => this.ePinnedRightCells,
            refreshPinnedCellGroupWidths: () => this.refreshPinnedCellGroupWidths(),
            showFullWidth: (compDetails) => this.showFullWidth(compDetails),
            getFullWidthCellRenderer: () => this.fullWidthCellRenderer,
            getFullWidthCellRendererParams: () => this.fullWidthCellRendererParams,
            toggleCss: (name, on) => this.toggleCss(name, on),
            setUserStyles: (styles: RowStyle | undefined) => _addStylesToElement(rowDiv, styles),
            setTop: (top) => (style.top = top),
            setTransform: (transform) => (style.transform = transform),
            setRowIndex: (rowIndex) => rowDiv.setAttribute('row-index', rowIndex),
            setRowId: (rowId: string) => rowDiv.setAttribute('row-id', rowId),
            setRowBusinessKey: (businessKey) => rowDiv.setAttribute('row-business-key', businessKey),
            refreshFullWidth: (getUpdatedParams) => {
                const params = getUpdatedParams();
                this.fullWidthCellRendererParams = params;
                return this.fullWidthCellRenderer?.refresh?.(params) ?? false;
            },
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
                this.setFullWidthRowComp(cellRenderer, compDetails.params);
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
        this.updatePinnedCellGroupWidths();
        this.ensureDomOrder(cellCtrls);
    }

    private ensureDomOrder(cellCtrls: CellCtrl[]): void {
        if (!this.domOrder) {
            return;
        }

        const leftElementsInOrder: HTMLElement[] = [];
        const centerElementsInOrder: HTMLElement[] = [];
        const rightElementsInOrder: HTMLElement[] = [];
        for (const cellCtrl of cellCtrls) {
            const cellComp = this.cellComps.get(cellCtrl.instanceId);
            if (cellComp) {
                const pinned = cellCtrl.column.getPinned();
                if (pinned === 'left') {
                    leftElementsInOrder.push(cellComp.getGui());
                } else if (pinned === 'right') {
                    rightElementsInOrder.push(cellComp.getGui());
                } else {
                    centerElementsInOrder.push(cellComp.getGui());
                }
            }
        }

        if (this.ePinnedLeftCells) {
            _setDomChildOrder(this.ePinnedLeftCells, leftElementsInOrder);
        }
        if (this.eScrollingCells) {
            _setDomChildOrder(this.eScrollingCells, centerElementsInOrder);
        }
        if (this.ePinnedRightCells) {
            _setDomChildOrder(this.ePinnedRightCells, rightElementsInOrder);
        }
    }

    private newCellComp(cellCtrl: CellCtrl): void {
        const editing = this.beans.editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false;
        const parent =
            cellCtrl.column.getPinned() === 'left'
                ? this.ePinnedLeftCells
                : cellCtrl.column.getPinned() === 'right'
                  ? this.ePinnedRightCells
                  : this.eScrollingCells;
        const eParent = parent ?? this.getGui();
        const cellComp = new CellComp(this.beans, cellCtrl, this.rowCtrl.printLayout, eParent, editing);
        this.cellComps.set(cellCtrl.instanceId, cellComp);
        eParent.appendChild(cellComp.getGui());
    }

    private updatePinnedCellGroupWidths(): void {
        if (!this.ePinnedLeftCells || !this.ePinnedRightCells || !this.eScrollingCells) {
            return;
        }

        const { visibleCols } = this.beans;
        const leftWidth = visibleCols.getLeftStickyColumnContainerWidth();
        const centerWidth = visibleCols.bodyWidth;
        const rightWidth = visibleCols.getRightStickyColumnContainerWidth();
        if (this.pinnedLeftWidth !== leftWidth) {
            this.ePinnedLeftCells.style.width = `${leftWidth}px`;
            this.ePinnedLeftCells.style.display = leftWidth > 0 ? '' : 'none';
            this.pinnedLeftWidth = leftWidth;
        }
        if (this.centerWidth !== centerWidth) {
            this.eScrollingCells.style.width = `${centerWidth}px`;
            this.centerWidth = centerWidth;
        }
        if (this.pinnedRightWidth !== rightWidth) {
            this.ePinnedRightCells.style.width = `${rightWidth}px`;
            this.ePinnedRightCells.style.display = rightWidth > 0 ? '' : 'none';
            this.pinnedRightWidth = rightWidth;
        }
    }

    private refreshPinnedCellGroupWidths(): void {
        this.updatePinnedCellGroupWidths();
    }

    public override destroy(): void {
        super.destroy();
        // Destroy all cells
        this.destroyCells(this.cellComps);
    }

    private setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp, params: ICellRendererParams): void {
        this.fullWidthCellRenderer = fullWidthRowComponent;
        this.fullWidthCellRendererParams = params;
        this.addDestroyFunc(() => {
            this.fullWidthCellRenderer = this.beans.context.destroyBean(this.fullWidthCellRenderer);
            this.fullWidthCellRendererParams = undefined;
        });
    }

    private destroyCells(cellComps: Map<CellCtrlInstanceId, CellComp | null>): void {
        for (const cellComp of cellComps.values()) {
            // could be old reference, ie removed cell
            if (!cellComp) {
                continue;
            }

            // check cellComp belongs in this container
            const instanceId = cellComp.cellCtrl.instanceId;
            if (this.cellComps.get(instanceId) !== cellComp) {
                continue;
            }

            cellComp.detach();
            cellComp.destroy();
            this.cellComps.delete(instanceId);
        }
    }
}
