import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import { _ensureDomOrder } from '../../agStack/utils/dom';
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
    _getRowViewportClass,
} from './rowContainerCtrl';

function isFlattenedPinnedRowContainer(name: RowContainerName): boolean {
    return (
        name === 'pinnedTopCenter' ||
        name === 'pinnedTopFullWidth' ||
        name === 'stickyTopCenter' ||
        name === 'stickyTopFullWidth' ||
        name === 'pinnedBottomCenter' ||
        name === 'pinnedBottomFullWidth' ||
        name === 'stickyBottomCenter' ||
        name === 'stickyBottomFullWidth'
    );
}

function getFlattenedPinnedRowPriority(name: RowContainerName | null): number {
    if (!name) {
        return 0;
    }
    if (name === 'pinnedTopCenter' || name === 'pinnedTopFullWidth') {
        return 1;
    }
    if (name === 'stickyTopCenter' || name === 'stickyTopFullWidth') {
        return 2;
    }
    if (name === 'stickyBottomCenter' || name === 'stickyBottomFullWidth') {
        return 1;
    }
    if (name === 'pinnedBottomCenter' || name === 'pinnedBottomFullWidth') {
        return 2;
    }
    return 1;
}

function getElementParams(name: RowContainerName, options: RowContainerOptions, beans: BeanCollection): ElementParams {
    const isCellSpanning = !!beans.gos.get('enableCellSpan') && !!options.getSpannedRowCtrls;

    if (isFlattenedPinnedRowContainer(name)) {
        // flattened pinned containers render rows directly into the host rowgroup.
        // keep only a minimal placeholder root so this component can attach and bootstrap.
        return {
            tag: 'div',
            ref: 'eContainer',
            role: 'presentation',
        };
    }

    const eContainerElement: ElementParams = {
        tag: 'div',
        ref: 'eContainer',
        cls: _getRowContainerClass(name),
        role: 'rowgroup',
    };
    const eSpannedContainerElement: ElementParams = {
        tag: 'div',
        ref: 'eSpannedContainer',
        cls: `ag-spanning-container ${_getRowSpanContainerClass(name)}`,
        role: 'presentation',
    };

    if (name === 'scrollingCenter') {
        return {
            ...eContainerElement,
            children: [isCellSpanning ? eSpannedContainerElement : null],
        };
    }

    if (options.type === 'center' || isCellSpanning) {
        eContainerElement.role = 'presentation';

        return {
            tag: 'div',
            ref: 'eViewport',
            cls: `ag-viewport ${_getRowViewportClass(name)}`,
            role: 'rowgroup',
            children: [eContainerElement, isCellSpanning ? eSpannedContainerElement : null],
        };
    }
    return eContainerElement;
}

export class RowContainerComp extends Component {
    private readonly eViewport: HTMLElement = RefPlaceholder;
    private readonly eContainer: HTMLElement = RefPlaceholder;
    private readonly eSpannedContainer: HTMLElement = RefPlaceholder;
    private eRowsContainer: HTMLElement = RefPlaceholder;
    private eSpannedRowsContainer: HTMLElement | undefined;
    private flattenedPinnedContainer = false;

    private readonly name: RowContainerName;
    private readonly options: RowContainerOptions;
    private readonly hostElement?: HTMLElement;

    private rowCompsNoSpan: { [id: RowCtrlInstanceId]: RowComp } = {};
    private rowCompsWithSpan: { [id: RowCtrlInstanceId]: RowComp } = {};

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;
    private initialised = false;

    constructor(params?: { name: string; hostElement?: HTMLElement }) {
        super();
        this.name = params?.name as RowContainerName;
        this.options = _getRowContainerOptions(this.name);
        this.hostElement = params?.hostElement;
    }

    public postConstruct(): void {
        this.setTemplate(getElementParams(this.name, this.options, this.beans));
        if (this.name === 'scrollingCenter') {
            this.initialiseComp();
            return;
        }
        if (isFlattenedPinnedRowContainer(this.name)) {
            this.flattenedPinnedContainer = true;
            if (!this.hostElement) {
                throw new Error(`Flattened pinned row container "${this.name}" requires hostElement`);
            }
            this.initialiseComp(this.hostElement);
            return;
        }
        this.initialiseComp();
    }

    private getGridViewportFromParent(): HTMLElement | null {
        const parentComp = this.getParentComponent<Component>();
        if (!parentComp) {
            return null;
        }
        return parentComp.getGui().querySelector('.ag-grid-viewport');
    }

    private initialiseComp(pinnedRowsParent?: HTMLElement): void {
        if (this.initialised) {
            return;
        }

        let eContainerForRows = this.eContainer;
        let eSpannedContainerForRows: HTMLElement | undefined = this.eSpannedContainer;
        let eViewportForCtrl =
            (this.name === 'scrollingCenter'
                ? (this.eContainer.closest('.ag-grid-viewport') as HTMLElement | null) ??
                  this.getGridViewportFromParent()
                : this.eViewport) ?? this.eContainer;

        if (pinnedRowsParent && isFlattenedPinnedRowContainer(this.name)) {
            this.flattenedPinnedContainer = true;
            eContainerForRows = pinnedRowsParent;
            // keep spanned rows rendered for pinned top/bottom containers by using the same host
            // rowgroup when flattened.
            const shouldRenderSpannedRows = !!this.options.getSpannedRowCtrls && !!this.beans.gos.get('enableCellSpan');
            eSpannedContainerForRows = shouldRenderSpannedRows ? eContainerForRows : undefined;
            eViewportForCtrl =
                (pinnedRowsParent.closest('.ag-grid-viewport') as HTMLElement | null) ?? pinnedRowsParent;
        }

        this.eRowsContainer = eContainerForRows;
        this.eSpannedRowsContainer = eSpannedContainerForRows;

        const compProxy: IRowContainerComp = {
            setHorizontalScroll: (offset: number) => (eViewportForCtrl.scrollLeft = offset),
            setViewportHeight: (height) => {
                if (this.name !== 'scrollingCenter') {
                    eViewportForCtrl.style.height = height;
                }
            },
            setRowCtrls: ({ rowCtrls }) => this.setRowCtrls(rowCtrls),
            setSpannedRowCtrls: (rowCtrls: RowCtrl[]) => this.setRowCtrls(rowCtrls, true),
            setDomOrder: (domOrder) => {
                if (!this.flattenedPinnedContainer) {
                    this.domOrder = domOrder;
                }
            },
            setContainerWidth: (width) => {
                eContainerForRows.style.width = width;
                if (eSpannedContainerForRows) {
                    eSpannedContainerForRows.style.width = width;
                }
            },
            setOffsetTop: (offset) => {
                const top = `translateY(${offset})`;
                eContainerForRows.style.transform = top;
                if (eSpannedContainerForRows) {
                    eSpannedContainerForRows.style.transform = top;
                }
            },
        };

        const ctrl = this.createManagedBean(new RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, eContainerForRows, eSpannedContainerForRows, eViewportForCtrl);

        if (this.flattenedPinnedContainer) {
            this.getGui().remove();
        }
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

        const container = spanContainer ? this.eSpannedRowsContainer : this.eRowsContainer;
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
            if (this.flattenedPinnedContainer) {
                eGui.setAttribute('row-container-name', this.name);
                this.insertFlattenedPinnedRow(eGui, container);
                continue;
            }
            if (!domOrder) {
                if (isNew) {
                    container.appendChild(eGui);
                }
            } else {
                this.ensureDomOrder(eGui, container);
            }
        }
    }

    private insertFlattenedPinnedRow(eRow: HTMLElement, container: HTMLElement): void {
        const rowPriority = getFlattenedPinnedRowPriority(this.name);
        const rowTop = Number.parseFloat(eRow.style.top) || 0;
        let insertBefore: HTMLElement | null = null;

        for (const child of Array.from(container.children) as HTMLElement[]) {
            if (child === eRow) {
                continue;
            }
            const childPriority = getFlattenedPinnedRowPriority(
                child.getAttribute('row-container-name') as RowContainerName
            );
            if (childPriority > rowPriority) {
                insertBefore = child;
                break;
            }
            if (childPriority === rowPriority) {
                const childTop = Number.parseFloat(child.style.top) || 0;
                if (childTop > rowTop) {
                    insertBefore = child;
                    break;
                }
            }
        }

        if (insertBefore) {
            insertBefore.before(eRow);
        } else if (eRow.parentElement !== container || eRow !== container.lastElementChild) {
            container.appendChild(eRow);
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
