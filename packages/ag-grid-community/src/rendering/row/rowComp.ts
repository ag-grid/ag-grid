import { _addStylesToElement, _setDomChildOrder } from '../../agStack/utils/dom';
import type { BeanCollection } from '../../context/context';
import type { RowStyle } from '../../entities/gridOptions';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _createElement } from '../../utils/element';
import { Component } from '../../widgets/component';
import { CellComp } from '../cell/cellComp';
import type { CellCtrl, CellCtrlInstanceId } from '../cell/cellCtrl';
import { FullWidthRendererManager } from './fullWidthRendererManager';
import type { IRowComp, RowCtrl } from './rowCtrl';

const createCellSection = (sectionClass: string): { container: HTMLElement; wrapper: HTMLElement } => {
    const wrapper = _createElement({
        tag: 'div',
        role: 'presentation',
        cls: 'ag-grid-container-wrapper',
    });
    const container = _createElement({
        tag: 'div',
        cls: sectionClass,
        role: 'presentation',
    });
    container.appendChild(wrapper);
    return { container, wrapper };
};

export class RowComp extends Component {
    private readonly fullWidthMgr: FullWidthRendererManager;

    private readonly rowCtrl: RowCtrl;
    private readonly ePinnedLeftSection: HTMLElement | undefined;
    private readonly ePinnedLeftCells: HTMLElement | undefined;
    private readonly eScrollingCells: HTMLElement | undefined;
    private readonly ePinnedRightSection: HTMLElement | undefined;
    private readonly ePinnedRightCells: HTMLElement | undefined;

    private domOrder: boolean;
    private readonly cellComps: Map<CellCtrlInstanceId, CellComp | null> = new Map();

    constructor(ctrl: RowCtrl, beans: BeanCollection, containerType: RowContainerType) {
        super();

        this.beans = beans;
        this.rowCtrl = ctrl;
        this.fullWidthMgr = new FullWidthRendererManager(beans, ctrl);
        const shouldCreateCellSections = ctrl.shouldCreateCellSections();

        const rowDiv = _createElement({ tag: 'div', role: 'row', attrs: { 'comp-id': `${this.getCompId()}` } });
        if (shouldCreateCellSections) {
            const leftSection = createCellSection('ag-grid-pinned-left-cells');
            const centerSection = createCellSection('ag-grid-scrolling-cells');
            const rightSection = createCellSection('ag-grid-pinned-right-cells');

            this.ePinnedLeftSection = leftSection.container;
            this.ePinnedLeftCells = leftSection.wrapper;
            this.eScrollingCells = centerSection.wrapper;
            this.ePinnedRightSection = rightSection.container;
            this.ePinnedRightCells = rightSection.wrapper;

            rowDiv.append(leftSection.container, centerSection.container, rightSection.container);
        }
        this.setInitialStyle(rowDiv);
        this.setTemplateFromElement(rowDiv);

        const style = rowDiv.style;
        this.domOrder = this.rowCtrl.getDomOrder();

        const compProxy: IRowComp = {
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
            setCellCtrls: (cellCtrls) => this.setCellCtrls(cellCtrls),
            getPinnedLeftRowElement: () => this.ePinnedLeftCells,
            getPinnedLeftSectionElement: () => this.ePinnedLeftSection,
            getScrollingRowElement: () => this.eScrollingCells,
            getPinnedRightRowElement: () => this.ePinnedRightCells,
            getPinnedRightSectionElement: () => this.ePinnedRightSection,
            showFullWidth: (compDetails) => this.fullWidthMgr.show(compDetails, this.getGui(), () => this.isAlive()),
            showEmbeddedFullWidth: (compDetails) =>
                this.fullWidthMgr.showEmbedded(
                    compDetails,
                    this.ePinnedLeftCells,
                    this.eScrollingCells,
                    this.ePinnedRightCells,
                    this.getGui(),
                    () => this.isAlive()
                ),
            getFullWidthCellRenderers: () => this.fullWidthMgr.getAllRenderers(),
            getFullWidthCellRendererParams: () => this.fullWidthMgr.getPrimaryParams(),
            getFullWidthCellRendererParamsForPinned: (pinned) => this.fullWidthMgr.getParamsForPinned(pinned),
            toggleCss: (name, on) => this.toggleCss(name, on),
            setUserStyles: (styles: RowStyle | undefined) => _addStylesToElement(rowDiv, styles),
            setTop: (top) => (style.top = top),
            setTransform: (transform) => (style.transform = transform),
            setRowIndex: (rowIndex) => rowDiv.setAttribute('row-index', rowIndex),
            setRowId: (rowId: string) => rowDiv.setAttribute('row-id', rowId),
            setRowBusinessKey: (businessKey) => rowDiv.setAttribute('row-business-key', businessKey),
            refreshFullWidth: (getUpdatedParams) => this.fullWidthMgr.refresh(getUpdatedParams),
            refreshEmbeddedFullWidth: (getUpdatedParams) => this.fullWidthMgr.refreshEmbedded(getUpdatedParams),
        };

        ctrl.setComp(compProxy, this.getGui(), containerType, undefined);
        this.addDestroyFunc(() => {
            ctrl.unsetComp(containerType);
        });
    }

    private setInitialStyle(container: HTMLElement): void {
        const transform = this.rowCtrl.getInitialTransform();

        if (transform) {
            container.style.setProperty('transform', transform);
        } else {
            const top = this.rowCtrl.getInitialRowTop();
            if (top) {
                container.style.setProperty('top', top);
            }
        }
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

    public override destroy(): void {
        super.destroy();
        this.fullWidthMgr.destroy();
        this.destroyCells(this.cellComps);
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
