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

function usesGridViewportForScrolling(name: RowContainerName): boolean {
    return name === 'scrollingCenter' || name === 'pinnedTopCenter' || name === 'pinnedBottomCenter';
}

function getElementParams(name: RowContainerName, options: RowContainerOptions, beans: BeanCollection): ElementParams {
    const isCellSpanning = !!beans.gos.get('enableCellSpan') && !!options.getSpannedRowCtrls;

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

    if (usesGridViewportForScrolling(name)) {
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

    private getGridViewportFromController(): HTMLElement | null {
        const gridBodyCtrl = this.beans.ctrlsSvc.get('gridBodyCtrl');
        return gridBodyCtrl?.eGridViewport ?? null;
    }

    private getGridViewportFromParentComponent(): HTMLElement | null {
        const parentComp = this.getParentComponent<Component>();
        return parentComp?.getGui().querySelector('.ag-grid-viewport') ?? null;
    }

    private getGridViewportFromParentChain(start: HTMLElement | null): HTMLElement | null {
        let current: HTMLElement | null = start;
        while (current) {
            if (current.classList.contains('ag-grid-viewport')) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    private initialiseComp(): void {
        if (this.initialised || !this.isAlive()) {
            return;
        }

        const eGridViewport =
            this.getGridViewportFromController() ??
            this.getGridViewportFromParentChain(this.eContainer) ??
            this.getGridViewportFromParentComponent();
        const needsExternalViewport = usesGridViewportForScrolling(this.name);
        if (needsExternalViewport && !eGridViewport) {
            window.requestAnimationFrame(() => this.initialiseComp());
            return;
        }

        const eContainerForRows = this.eContainer;
        const eSpannedContainerForRows: HTMLElement | undefined = this.eSpannedContainer;
        const eViewportForCtrl =
            (usesGridViewportForScrolling(this.name) ? eGridViewport : this.eViewport) ?? this.eContainer;

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
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
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
