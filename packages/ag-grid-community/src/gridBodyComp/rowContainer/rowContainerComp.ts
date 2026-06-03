import { RefPlaceholder, _ensureDomOrder, _setDisplayed } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import { RowComp } from '../../rendering/row/rowComp';
import type { RowCtrl, RowCtrlInstanceId } from '../../rendering/row/rowCtrl';
import type { ElementParams } from '../../utils/element';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import type { IRowContainerComp, RowContainerName, RowContainerOptions } from './rowContainerCtrl';
import {
    RowContainerCtrl,
    _getRowContainerClass,
    _getRowContainerOptions,
    _getRowSpanContainerClass,
} from './rowContainerCtrl';

function getElementParams(name: RowContainerName, options: RowContainerOptions, beans: BeanCollection): ElementParams {
    const isCellSpanning = !!beans.gos.get('enableCellSpan') && !!options.getSpannedRowCtrls;
    return {
        tag: 'div',
        ref: 'eContainer',
        cls: _getRowContainerClass(name),
        role: 'presentation',
        children: [
            isCellSpanning
                ? {
                      tag: 'div',
                      ref: 'eSpannedContainer',
                      cls: `ag-spanning-container ${_getRowSpanContainerClass(name)}`,
                      role: 'presentation',
                  }
                : null,
        ],
    };
}

export class RowContainerComp extends Component {
    private readonly eContainer: HTMLElement = RefPlaceholder;
    private readonly eSpannedContainer: HTMLElement = RefPlaceholder;

    private readonly name: RowContainerName;
    private readonly options: RowContainerOptions;

    private rowCompsNoSpan: { [id: RowCtrlInstanceId]: RowComp } = {};
    private rowCompsWithSpan: { [id: RowCtrlInstanceId]: RowComp } = {};

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;
    private initialised = false;

    constructor(params?: { name: string }) {
        super();
        this.name = params?.name as RowContainerName;
        this.options = _getRowContainerOptions(this.name);
    }

    public postConstruct(): void {
        this.setTemplate(getElementParams(this.name, this.options, this.beans));
        this.initialiseComp();
    }

    private initialiseComp(): void {
        if (this.initialised || !this.isAlive()) {
            return;
        }

        const gridBodyCtrl = this.beans.ctrlsSvc.getGridBodyCtrl();
        let eGridViewport: HTMLElement | undefined = gridBodyCtrl?.eGridViewport;
        if (!eGridViewport) {
            const parentComponent = this.getParentComponent() as { eGridViewport?: HTMLElement };
            eGridViewport = parentComponent?.eGridViewport;
        }

        const eContainer = this.eContainer;
        const eSpannedContainer: HTMLElement | undefined = this.eSpannedContainer;
        const eViewport = eGridViewport ?? eContainer;

        const compProxy: IRowContainerComp = {
            setRowCtrls: ({ rowCtrls }) => this.setRowCtrls(rowCtrls),
            setSpannedRowCtrls: (rowCtrls: RowCtrl[]) => this.setRowCtrls(rowCtrls, true),
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
            setContainerWidth: (width) => {
                eContainer.style.width = width;
                if (eSpannedContainer) {
                    eSpannedContainer.style.width = width;
                }
            },
            setOffsetTop: (offset) => {
                const top = `translateY(${offset})`;
                eContainer.style.transform = top;
                if (eSpannedContainer) {
                    eSpannedContainer.style.transform = top;
                }
            },
            setHidden: (hidden: boolean) => _setDisplayed(eContainer, !hidden, { skipAriaHidden: true }),
        };

        const ctrl = this.createManagedBean(new RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, eContainer, eSpannedContainer, eViewport);
        this.initialised = true;
    }

    public override destroy(): void {
        // destroys all row comps
        this.setRowCtrls([]);
        this.setRowCtrls([], true);
        super.destroy();
        this.lastPlacedElement = null;
    }

    private setRowCtrls(rowCtrls: RowCtrl[], spanContainer?: boolean): void {
        const { beans, options } = this;

        const container = spanContainer ? this.eSpannedContainer : this.eContainer;
        if (!container) {
            return;
        }
        const oldRows = spanContainer ? { ...this.rowCompsWithSpan } : { ...this.rowCompsNoSpan };
        const newComps: { [id: RowCtrlInstanceId]: RowComp } = {};

        if (spanContainer) {
            this.rowCompsWithSpan = newComps;
        } else {
            this.rowCompsNoSpan = newComps;
        }

        this.lastPlacedElement = null;

        const orderedRows: [rowComp: RowComp, isNew: boolean][] = [];

        for (const rowCtrl of rowCtrls) {
            const instanceId = rowCtrl.instanceId;
            const existingRowComp = oldRows[instanceId];

            let rowComp: RowComp;

            if (existingRowComp) {
                rowComp = existingRowComp;
                delete oldRows[instanceId];
            } else {
                if (!rowCtrl.rowNode.displayed) {
                    continue;
                }
                rowComp = new RowComp(rowCtrl, beans, options.type);
            }
            newComps[instanceId] = rowComp;
            orderedRows.push([rowComp, !existingRowComp]);
        }

        this.removeOldRows(Object.values(oldRows));
        this.addRowNodes(orderedRows, container);
    }

    private addRowNodes(rows: [rowComp: RowComp, isNew: boolean][], container: HTMLElement): void {
        const { domOrder } = this;
        for (const [rowComp, isNew] of rows) {
            const eGui = rowComp.getGui();
            if (!domOrder) {
                if (isNew) {
                    container.appendChild(eGui);
                }
            } else {
                this.ensureDomOrder(eGui, container);
            }
        }
    }

    private removeOldRows(rowComps: RowComp[]): void {
        for (const oldRowComp of rowComps) {
            oldRowComp.getGui().remove();
            oldRowComp.destroy();
        }
    }

    private ensureDomOrder(eRow: HTMLElement, container: HTMLElement): void {
        _ensureDomOrder(container, eRow, this.lastPlacedElement);
        this.lastPlacedElement = eRow;
    }
}

export const RowContainerSelector: ComponentSelector = {
    selector: 'AG-ROW-CONTAINER',
    component: RowContainerComp,
};
