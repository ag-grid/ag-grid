import { _addStylesToElement, _setDomChildOrder } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { RowStyle } from '../../entities/gridOptions';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { HorizontalSection, HorizontalSectionMap } from '../../interfaces/iGridSection';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _createElement } from '../../utils/element';
import { Component } from '../../widgets/component';
import { CellComp } from '../cell/cellComp';
import type { CellCtrl } from '../cell/cellCtrl';
import type { ICellRendererComp, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import { NO_CELLS } from './normalRowFeature';
import type { IRowComp, MappedPinnedCellGroupWidths, RowCtrl } from './rowCtrl';

const LEAF_RENDERER_TAGS = new Set(['CANVAS', 'IMG', 'SVG', 'VIDEO', 'AUDIO', 'INPUT', 'IFRAME', 'PICTURE']);

const createCellSection = (sectionClass: string, pinned: boolean): { container: HTMLElement; wrapper: HTMLElement } => {
    const container = _createElement({
        tag: 'div',
        cls: sectionClass,
        role: 'presentation',
    });
    if (!pinned) {
        return { container, wrapper: container };
    }
    const wrapper = _createElement({
        tag: 'div',
        role: 'presentation',
        cls: 'ag-grid-container-wrapper',
    });
    container.appendChild(wrapper);
    return { container, wrapper };
};

export class RowComp extends Component {
    /** The container's row pass that last drew this row. */
    public drawnInPass = 0;
    private fullWidthCellRenderer: ICellRendererComp | null | undefined;
    private fullWidthCellRendererParams: ICellRendererParams | undefined;
    /** Only an embedded full-width row has sections, so the maps are created on first use. */
    private fullWidthCellRenderersBySection: Partial<HorizontalSectionMap<ICellRendererComp | null>> | null = null;
    private fullWidthCellRendererParamsBySection: Partial<HorizontalSectionMap<ICellRendererParams>> | null = null;

    private readonly rowCtrl: RowCtrl;
    private readonly ePinnedLeftSection: HTMLElement | undefined;
    private readonly ePinnedLeftCells: HTMLElement | undefined;
    private readonly eScrollingCells: HTMLElement | undefined;
    private readonly ePinnedRightSection: HTMLElement | undefined;
    private readonly ePinnedRightCells: HTMLElement | undefined;

    private domOrder: boolean;
    private pinnedWidths: MappedPinnedCellGroupWidths | undefined = undefined;
    /** The lists last drawn: a row has one row comp at a time, and its feature never mutates a list once given. */
    private drawnLeft: CellCtrl[] = NO_CELLS;
    private drawnCenter: CellCtrl[] = NO_CELLS;
    private drawnRight: CellCtrl[] = NO_CELLS;
    private cellsPass = 0;

    constructor(ctrl: RowCtrl, beans: BeanCollection) {
        super();

        this.beans = beans;
        this.rowCtrl = ctrl;
        const shouldCreateCellSections = ctrl.shouldCreateCellSections();

        const rowDiv = _createElement({ tag: 'div', role: 'row', attrs: { 'comp-id': `${this.getCompId()}` } });
        if (shouldCreateCellSections) {
            const leftSection = createCellSection('ag-grid-pinned-left-cells', true);
            const centerSection = createCellSection('ag-grid-scrolling-cells', false);
            const rightSection = createCellSection('ag-grid-pinned-right-cells', true);

            this.ePinnedLeftSection = leftSection.container;
            this.ePinnedLeftCells = leftSection.wrapper;
            this.eScrollingCells = centerSection.wrapper;
            this.ePinnedRightSection = rightSection.container;
            this.ePinnedRightCells = rightSection.wrapper;

            // The centre lane is always present; the pinned lanes are attached on demand.
            rowDiv.append(centerSection.container);
        }
        this.setInitialStyle(rowDiv);
        this.setTemplateFromElement(rowDiv);

        const style = rowDiv.style;
        this.domOrder = this.rowCtrl.getDomOrder();

        const compProxy: IRowComp = {
            setDomOrder: (domOrder) => this.setDomOrder(domOrder),
            setCellCtrls: (left, center, right) => this.setCellCtrls(left, center, right),
            getPinnedLeftRowElement: () => this.ePinnedLeftCells,
            getScrollingRowElement: () => this.eScrollingCells,
            getPinnedRightRowElement: () => this.ePinnedRightCells,
            refreshPinnedSections: () => this.refreshPinnedSections(),
            showFullWidth: (compDetails) => this.showFullWidth(compDetails),
            showEmbeddedFullWidth: (compDetails) => this.showEmbeddedFullWidth(compDetails),
            getFullWidthCellRenderers: () => this.getAllFullWidthCellRenderers(),
            getFullWidthCellRendererParams: () => this.getPrimaryFullWidthCellRendererParams(),
            getFullWidthCellRendererParamsForPinned: (pinned: ColumnPinnedType) =>
                this.getFullWidthCellRendererParamsForPinned(pinned),
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
            refreshEmbeddedFullWidth: (getUpdatedParams) => this.refreshEmbeddedFullWidth(getUpdatedParams),
        };

        ctrl.setComp(compProxy, this.getGui(), undefined);
        this.addDestroyFunc(() => {
            ctrl.unsetComp();
        });
    }

    private refreshPinnedSections(): void {
        const widths = this.rowCtrl.getMappedPinnedCellGroupWidths();
        if (widths === this.pinnedWidths) {
            return;
        }
        this.pinnedWidths = widths;
        const eCenter = this.eScrollingCells;
        if (eCenter) {
            eCenter.style.width = `${widths.centerWidth}px`;
        }
        refreshPinnedSection(eCenter, this.ePinnedLeftSection, widths.leftWidth, widths.renderLeft, 'before');
        refreshPinnedSection(eCenter, this.ePinnedRightSection, widths.rightWidth, widths.renderRight, 'after');
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

    private showFullWidth(compDetails: UserCompDetails): void {
        const eRow = this.getGui();
        const eAnchor = _createElement({
            tag: 'div',
            cls: 'ag-full-width-anchor',
            role: this.rowCtrl.getFullWidthAnchorRole(),
        });
        eRow.appendChild(eAnchor);

        const callback = (cellRenderer: ICellRendererComp) => {
            if (this.isAlive()) {
                const eGui = cellRenderer.getGui();
                eAnchor.appendChild(eGui);
                this.rowCtrl.setupDetailRowAutoHeight(eGui);
                this.setFullWidthRowComp(cellRenderer, compDetails.params);
            } else {
                this.beans.context.destroyBean(cellRenderer);
            }
        };

        compDetails.newAgStackInstance().then(callback);
    }

    private showEmbeddedFullWidth(compDetails: HorizontalSectionMap<UserCompDetails>): void {
        this.showEmbeddedFullWidthSection('left', compDetails.left, this.ePinnedLeftCells);
        this.showEmbeddedFullWidthSection('center', compDetails.center, this.eScrollingCells);
        this.showEmbeddedFullWidthSection('right', compDetails.right, this.ePinnedRightCells);
    }

    private showEmbeddedFullWidthSection(
        section: HorizontalSection,
        compDetails: UserCompDetails,
        sectionHost: HTMLElement | undefined
    ): void {
        const host = sectionHost ?? this.getGui();
        const callback = (cellRenderer: ICellRendererComp) => {
            if (!this.isAlive()) {
                this.beans.context.destroyBean(cellRenderer);
                return;
            }

            const eGui = cellRenderer.getGui();
            if (eGui) {
                host.replaceChildren(eGui);
            } else {
                host.replaceChildren();
            }
            // Check the host for actual visible content after appending. Framework wrappers
            // (Angular/Vue) return container elements from getGui() even when the component
            // renders nothing, so a simple null check on eGui is insufficient. Treat known
            // leaf renderers (canvas, img, svg, ...) as content unconditionally; for other
            // elements, require either child elements or non-empty text.
            const firstEl = host.firstElementChild;
            const hasContent =
                firstEl != null &&
                (firstEl.childElementCount > 0 ||
                    !!firstEl.textContent?.trim() ||
                    LEAF_RENDERER_TAGS.has(firstEl.tagName));
            this.rowCtrl.setEmbeddedSectionHasContent(section, hasContent);
            this.setEmbeddedFullWidthRowComp(section, cellRenderer, compDetails.params);
            this.rowCtrl.refreshPinnedCellGroupWidths();
        };

        compDetails.newAgStackInstance().then(callback);
    }

    private refreshEmbeddedFullWidth(getUpdatedParams: (pinned: ColumnPinnedType) => ICellRendererParams): boolean {
        const left = this.refreshEmbeddedSection('left', getUpdatedParams('left'));
        const center = this.refreshEmbeddedSection('center', getUpdatedParams(null));
        const right = this.refreshEmbeddedSection('right', getUpdatedParams('right'));

        this.fullWidthCellRenderer = this.fullWidthCellRenderersBySection?.center ?? null;
        this.fullWidthCellRendererParams = this.fullWidthCellRendererParamsBySection?.center;
        return left && center && right;
    }

    private refreshEmbeddedSection(section: HorizontalSection, params: ICellRendererParams): boolean {
        this.fullWidthCellRendererParamsBySection ??= {};
        this.fullWidthCellRendererParamsBySection[section] = params;
        const renderer = this.fullWidthCellRenderersBySection?.[section];
        return !renderer?.refresh || renderer.refresh(params);
    }

    private getAllFullWidthCellRenderers(): (ICellRendererComp | null | undefined)[] | undefined {
        if (!this.rowCtrl.isEmbeddedFullWidth) {
            const renderer = this.fullWidthCellRenderer;
            return renderer ? [renderer] : undefined;
        }
        const renderers = this.fullWidthCellRenderersBySection;
        return renderers === null ? undefined : [renderers.left, renderers.center, renderers.right];
    }

    private getPrimaryFullWidthCellRendererParams(): ICellRendererParams | undefined {
        return this.fullWidthCellRendererParams ?? this.fullWidthCellRendererParamsBySection?.center;
    }

    private getFullWidthCellRendererParamsForPinned(pinned: ColumnPinnedType): ICellRendererParams | undefined {
        return this.fullWidthCellRendererParamsBySection?.[this.getEmbeddedSectionForPinned(pinned)];
    }

    private getEmbeddedSectionForPinned(pinned: ColumnPinnedType): HorizontalSection {
        if (pinned === 'left') {
            return 'left';
        }
        if (pinned === 'right') {
            return 'right';
        }
        return 'center';
    }

    // ensureDomOrder is documented as initial, yet rows follow a framework prop change; investigate whether to
    // make it truly initial, which would let this go with RowCtrl's listener (AG-18759).
    private setDomOrder(domOrder: boolean): void {
        const turnedOn = domOrder && !this.domOrder;
        this.domOrder = domOrder;
        if (!turnedOn) {
            return;
        }
        // an unchanged lane is not drawn again, so one drawn unordered is put in order here
        orderLane(this.ePinnedLeftCells, this.drawnLeft);
        orderLane(this.eScrollingCells, this.drawnCenter);
        orderLane(this.ePinnedRightCells, this.drawnRight);
    }

    private setCellCtrls(left: CellCtrl[], center: CellCtrl[], right: CellCtrl[]): void {
        const { drawnLeft, drawnCenter, drawnRight } = this;
        this.drawnLeft = left;
        this.drawnCenter = center;
        this.drawnRight = right;
        this.drawLane(this.ePinnedLeftCells, drawnLeft, left);
        this.drawLane(this.eScrollingCells, drawnCenter, center);
        this.drawLane(this.ePinnedRightCells, drawnRight, right);
    }

    private drawLane(container: HTMLElement | undefined, prevCellCtrls: CellCtrl[], cellCtrls: CellCtrl[]): void {
        if (prevCellCtrls === cellCtrls || !container) {
            return;
        }
        const pass = ++this.cellsPass;
        const len = cellCtrls.length;
        // a new cell goes in before the next one already drawn, so the lane keeps column order without moving a
        // cell, and a span drawn over a kept cell paints beneath it
        let nextDrawnIndex = prevCellCtrls.length === 0 ? len : 0;
        let nextDrawnCell: HTMLElement | null = null;
        const elements: HTMLElement[] | null = this.domOrder ? [] : null;

        for (let i = 0; i < len; ++i) {
            const cellCtrl = cellCtrls[i];
            let cellComp = cellCtrl.drawnComp;
            if (cellComp !== undefined) {
                cellComp.drawnInPass = pass;
            } else {
                if (nextDrawnIndex <= i) {
                    nextDrawnCell = null;
                    for (nextDrawnIndex = i + 1; nextDrawnIndex < len; ++nextDrawnIndex) {
                        const drawn = cellCtrls[nextDrawnIndex].drawnComp;
                        if (drawn) {
                            nextDrawnCell = drawn.getGui();
                            break;
                        }
                    }
                }
                cellComp = this.newCellComp(cellCtrl, container, nextDrawnCell, pass);
            }
            if (elements !== null) {
                elements.push(cellComp.getGui());
            }
        }

        destroyCells(prevCellCtrls, pass);
        if (elements !== null) {
            _setDomChildOrder(container, elements);
        }
    }

    private newCellComp(cellCtrl: CellCtrl, eLane: HTMLElement, eBefore: HTMLElement | null, pass: number): CellComp {
        const editing = this.beans.editSvc?.isEditing(cellCtrl, { withOpenEditor: true }) ?? false;
        const cellComp = new CellComp(this.beans, cellCtrl, this.rowCtrl.printLayout, eLane, editing);
        cellComp.drawnInPass = pass;
        cellCtrl.drawnComp = cellComp;
        eLane.insertBefore(cellComp.getGui(), eBefore);
        return cellComp;
    }

    public override destroy(): void {
        super.destroy();
        destroyCells(this.drawnLeft, -1); // passes count from 1, so no comp is kept
        destroyCells(this.drawnCenter, -1);
        destroyCells(this.drawnRight, -1);
    }

    private setFullWidthRowComp(fullWidthRowComponent: ICellRendererComp, params: ICellRendererParams): void {
        this.fullWidthCellRenderer = fullWidthRowComponent;
        this.fullWidthCellRendererParams = params;
        this.addDestroyFunc(() => {
            this.fullWidthCellRenderer = this.beans.context.destroyBean(this.fullWidthCellRenderer);
            this.fullWidthCellRendererParams = undefined;
        });
    }

    private setEmbeddedFullWidthRowComp(
        section: HorizontalSection,
        fullWidthRowComponent: ICellRendererComp,
        params: ICellRendererParams
    ): void {
        this.fullWidthCellRenderersBySection ??= {};
        this.fullWidthCellRendererParamsBySection ??= {};
        const renderersBySection = this.fullWidthCellRenderersBySection;
        const paramsBySection = this.fullWidthCellRendererParamsBySection;
        renderersBySection[section] = fullWidthRowComponent;
        paramsBySection[section] = params;

        if (section === 'center') {
            this.fullWidthCellRenderer = fullWidthRowComponent;
            this.fullWidthCellRendererParams = params;
        }

        this.addDestroyFunc(() => {
            renderersBySection[section] = this.beans.context.destroyBean(renderersBySection[section]);
            paramsBySection[section] = undefined;
            if (section === 'center') {
                this.fullWidthCellRenderer = null;
                this.fullWidthCellRendererParams = undefined;
            }
        });
    }
}

const refreshPinnedSection = (
    eCenter: HTMLElement | undefined,
    eSection: HTMLElement | undefined,
    width: number,
    shouldRender: boolean,
    method: 'after' | 'before'
): void => {
    if (!eSection) {
        return;
    }
    if (!shouldRender) {
        eSection.remove();
        return;
    }
    eSection.style.width = `${width}px`;
    if (!eSection.parentNode && eCenter) {
        eCenter[method](eSection);
    }
};

const orderLane = (container: HTMLElement | undefined, cellCtrls: CellCtrl[]): void => {
    const len = cellCtrls.length;
    if (!container || len === 0) {
        return;
    }
    const elements: HTMLElement[] = [];
    for (let i = 0; i < len; ++i) {
        const cellComp = cellCtrls[i].drawnComp;
        if (cellComp !== undefined) {
            elements.push(cellComp.getGui());
        }
    }
    _setDomChildOrder(container, elements);
};

const destroyCells = (cellCtrls: CellCtrl[], keepPass: number): void => {
    for (let i = 0, len = cellCtrls.length; i < len; ++i) {
        const cellCtrl = cellCtrls[i];
        const cellComp = cellCtrl.drawnComp;
        if (cellComp !== undefined && cellComp.drawnInPass !== keepPass) {
            cellComp.detach();
            cellComp.destroy();
            cellCtrl.drawnComp = undefined;
        }
    }
};
