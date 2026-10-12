import { RefPlaceholder, _ensureDomOrder, _setDisplayed } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import { RowComp } from '../../rendering/row/rowComp';
import type { RowCtrl } from '../../rendering/row/rowCtrl';
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

/** Shared by every list with no rows: a drawn list is only read, then replaced. */
const NO_ROWS: RowCtrl[] = [];

export class RowContainerComp extends Component {
    private readonly eContainer: HTMLElement = RefPlaceholder;
    private readonly eSpannedContainer: HTMLElement = RefPlaceholder;

    private readonly name: RowContainerName;

    /** The lists last drawn, swept for the rows the next list no longer has. */
    private drawnNoSpan: RowCtrl[] = NO_ROWS;
    private drawnWithSpan: RowCtrl[] = NO_ROWS;
    private rowsPass = 0;

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;
    private initialised = false;

    constructor(params?: { name: string }) {
        super();
        this.name = params?.name as RowContainerName;
    }

    public postConstruct(): void {
        this.setTemplate(getElementParams(this.name, _getRowContainerOptions(this.name), this.beans));
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
        const beans = this.beans;

        const container = spanContainer ? this.eSpannedContainer : this.eContainer;
        if (!container) {
            return;
        }
        const prevRowCtrls = spanContainer ? this.drawnWithSpan : this.drawnNoSpan;
        const drawn: RowCtrl[] = rowCtrls.length === 0 ? NO_ROWS : [];
        if (spanContainer) {
            this.drawnWithSpan = drawn;
        } else {
            this.drawnNoSpan = drawn;
        }

        this.lastPlacedElement = null;

        const pass = ++this.rowsPass;
        const domOrder = this.domOrder;
        // Every row when ordering the DOM, else only the new ones, which are appended.
        let rowsToPlace: RowComp[] | null = null;

        for (let i = 0, len = rowCtrls.length; i < len; ++i) {
            const rowCtrl = rowCtrls[i];
            let rowComp = rowCtrl.drawnRowComp;

            if (rowComp) {
                if (domOrder) {
                    rowsToPlace ??= [];
                    rowsToPlace.push(rowComp);
                }
            } else if (rowCtrl.rowNode.displayed) {
                rowComp = new RowComp(rowCtrl, beans);
                rowCtrl.drawnRowComp = rowComp;
                rowsToPlace ??= [];
                rowsToPlace.push(rowComp);
            } else {
                continue;
            }
            rowComp.drawnInPass = pass;
            drawn.push(rowCtrl);
        }

        if (rowsToPlace !== null) {
            for (let i = 0, len = rowsToPlace.length; i < len; ++i) {
                const eGui = rowsToPlace[i].getGui();
                if (domOrder) {
                    this.ensureDomOrder(eGui, container);
                } else {
                    container.appendChild(eGui);
                }
            }
        }

        // Last, as a destroy runs user code that can lay this list out again: a row a later layout kept is newer.
        for (let i = 0, len = prevRowCtrls.length; i < len; ++i) {
            const rowCtrl = prevRowCtrls[i];
            const rowComp = rowCtrl.drawnRowComp;
            if (rowComp !== undefined && rowComp.drawnInPass < pass) {
                rowCtrl.drawnRowComp = undefined;
                rowComp.getGui().remove();
                rowComp.destroy();
            }
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
