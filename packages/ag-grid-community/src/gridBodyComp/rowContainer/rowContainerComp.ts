import { RefPlaceholder } from '../../agStack/interfaces/agComponent';
import { _ensureDomOrder } from '../../agStack/utils/dom';
import type { BeanCollection } from '../../context/context';
import { RowComp } from '../../rendering/row/rowComp';
import type { RowCtrl, RowCtrlInstanceId } from '../../rendering/row/rowCtrl';
import type { ElementParams } from '../../utils/element';
import type { ComponentSelector } from '../../widgets/component';
import { Component } from '../../widgets/component';
import type {
    PinnedRowContainerRendererSource,
    PinnedRowContainerRendererSourceConfig,
    PinnedSection,
    PinnedSectionLane,
    PinnedSectionStream,
} from '../pinnedRowContainerRendererFeature';
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

let nextFlattenedSourceId = 0;

function getFlattenedPinnedSourceConfig(
    name: RowContainerName
): Omit<PinnedRowContainerRendererSourceConfig, 'id'> | undefined {
    if (!isFlattenedPinnedRowContainer(name)) {
        return undefined;
    }

    const section: PinnedSection = name.includes('Top') ? 'top' : 'bottom';
    const stream: PinnedSectionStream = name.includes('FullWidth') ? 'fullWidth' : 'center';
    const lane: PinnedSectionLane = name.startsWith('sticky') ? 'sticky' : 'pinned';

    return {
        section,
        stream,
        lane,
        order: 0,
    };
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
    private flattenedRowsSource: PinnedRowContainerRendererSource | undefined;
    private flattenedSpannedRowsSource: PinnedRowContainerRendererSource | undefined;
    private readonly flattenedSourceId = nextFlattenedSourceId++;

    private readonly name: RowContainerName;
    private readonly options: RowContainerOptions;
    private readonly hostElement?: HTMLElement;
    private readonly viewportElement?: HTMLElement;

    private rowCompsNoSpan: { [id: RowCtrlInstanceId]: RowComp } = {};
    private rowCompsWithSpan: { [id: RowCtrlInstanceId]: RowComp } = {};

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;
    private initialised = false;

    constructor(params?: { name: string; hostElement?: HTMLElement; viewportElement?: HTMLElement }) {
        super();
        this.name = params?.name as RowContainerName;
        this.options = _getRowContainerOptions(this.name);
        this.hostElement = params?.hostElement;
        this.viewportElement = params?.viewportElement;
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

    private initialiseComp(pinnedRowsParent?: HTMLElement): void {
        if (this.initialised || !this.isAlive()) {
            return;
        }

        const eGridViewport =
            this.viewportElement ??
            this.getGridViewportFromController() ??
            this.getGridViewportFromParentChain(this.eContainer) ??
            this.getGridViewportFromParentComponent();
        const needsExternalViewport = !!pinnedRowsParent || this.name === 'scrollingCenter';
        if (needsExternalViewport && !eGridViewport) {
            window.requestAnimationFrame(() => this.initialiseComp(pinnedRowsParent));
            return;
        }

        let eContainerForRows = this.eContainer;
        let eSpannedContainerForRows: HTMLElement | undefined = this.eSpannedContainer;
        let eViewportForCtrl = (this.name === 'scrollingCenter' ? eGridViewport : this.eViewport) ?? this.eContainer;

        if (pinnedRowsParent && isFlattenedPinnedRowContainer(this.name)) {
            const { ctrlsSvc, gos } = this.beans;
            const pinnedRowContainerRendererFeature = ctrlsSvc.getGridBodyCtrl().getPinnedRowContainerRendererFeature();
            if (!pinnedRowContainerRendererFeature) {
                throw new Error('PinnedRowContainerRendererFeature is not available');
            }

            this.flattenedPinnedContainer = true;
            eContainerForRows = pinnedRowsParent;
            // keep spanned rows rendered for pinned top/bottom containers by using the same host
            // rowgroup when flattened.
            const shouldRenderSpannedRows = !!this.options.getSpannedRowCtrls && !!gos.get('enableCellSpan');
            eSpannedContainerForRows = shouldRenderSpannedRows ? eContainerForRows : undefined;
            eViewportForCtrl = eGridViewport ?? pinnedRowsParent;
            const sourceConfig = getFlattenedPinnedSourceConfig(this.name);
            if (!sourceConfig) {
                throw new Error(`Missing pinned section source config for "${this.name}"`);
            }
            this.flattenedRowsSource = pinnedRowContainerRendererFeature.registerSource({
                ...sourceConfig,
                id: `${this.name}-rows-${this.flattenedSourceId}`,
            });
            if (shouldRenderSpannedRows) {
                this.flattenedSpannedRowsSource = pinnedRowContainerRendererFeature.registerSource({
                    ...sourceConfig,
                    id: `${this.name}-spanned-rows-${this.flattenedSourceId}`,
                    order: 1,
                });
            }
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
        this.flattenedRowsSource?.destroy();
        this.flattenedRowsSource = undefined;
        this.flattenedSpannedRowsSource?.destroy();
        this.flattenedSpannedRowsSource = undefined;
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
        if (this.flattenedPinnedContainer) {
            const source = spanContainer ? this.flattenedSpannedRowsSource : this.flattenedRowsSource;
            const rowElements = orderedRows.map(([rowComp]) => rowComp.getGui());
            rowElements.sort((a, b) => getFlattenedPinnedRowPosition(a) - getFlattenedPinnedRowPosition(b));
            source?.setRows(rowElements);
            return;
        }
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

function getFlattenedPinnedRowPosition(eRow: HTMLElement): number {
    const top = Number.parseFloat(eRow.style.top);
    if (Number.isFinite(top)) {
        return top;
    }

    const transform = eRow.style.transform;
    if (transform) {
        const transformMatch = /translateY\((-?\d+(?:\.\d+)?)px\)/.exec(transform);
        if (transformMatch) {
            const transformTop = Number.parseFloat(transformMatch[1]);
            if (Number.isFinite(transformTop)) {
                return transformTop;
            }
        }
    }

    const rowIndex = Number.parseFloat(eRow.getAttribute('row-index') ?? '');
    return Number.isFinite(rowIndex) ? rowIndex : 0;
}
