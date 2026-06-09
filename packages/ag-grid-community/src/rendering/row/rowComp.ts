import { _addStylesToElement, _setDomChildOrder } from 'ag-stack';

import type { BeanCollection } from '../../context/context';
import type { RowStyle } from '../../entities/gridOptions';
import type { RowContainerType } from '../../gridBodyComp/rowContainer/rowContainerCtrl';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { HorizontalSection, HorizontalSectionMap } from '../../interfaces/iGridSection';
import type { UserCompDetails } from '../../interfaces/iUserCompDetails';
import { _createElement } from '../../utils/element';
import { Component } from '../../widgets/component';
import { CellComp } from '../cell/cellComp';
import type { CellCtrl, CellCtrlInstanceId } from '../cell/cellCtrl';
import type { ICellRendererComp, ICellRendererParams } from '../cellRenderers/iCellRenderer';
import type { IRowComp, RowCtrl } from './rowCtrl';

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
    private fullWidthCellRenderer: ICellRendererComp | null | undefined;
    private fullWidthCellRendererParams: ICellRendererParams | undefined;
    private fullWidthCellRenderersBySection: Partial<HorizontalSectionMap<ICellRendererComp | null>> = {};
    private fullWidthCellRendererParamsBySection: Partial<HorizontalSectionMap<ICellRendererParams>> = {};

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
            setDomOrder: (domOrder) => (this.domOrder = domOrder),
            setCellCtrls: (cellCtrls) => this.setCellCtrls(cellCtrls),
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

        ctrl.setComp(compProxy, this.getGui(), containerType, undefined);
        this.addDestroyFunc(() => {
            ctrl.unsetComp(containerType);
        });
    }

    private refreshPinnedSections(): void {
        const widths = this.rowCtrl.getMappedPinnedCellGroupWidths();
        const eCenter = this.eScrollingCells;
        if (eCenter) {
            eCenter.style.width = `${widths.centerWidth}px`;
        }

        const refreshPinnedSection = (
            eSection: HTMLElement | undefined,
            width: number,
            shouldRender: boolean,
            method: 'after' | 'before'
        ) => {
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

        refreshPinnedSection(this.ePinnedLeftSection, widths.leftWidth, widths.renderLeft, 'before');
        refreshPinnedSection(this.ePinnedRightSection, widths.rightWidth, widths.renderRight, 'after');
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
        const eAnchor = _createElement({ tag: 'div', cls: 'ag-full-width-anchor', role: 'presentation' });
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
        let refreshed = true;
        const sections: [HorizontalSection, ColumnPinnedType][] = [
            ['left', 'left'],
            ['center', null],
            ['right', 'right'],
        ];

        for (const [section, pinned] of sections) {
            const params = getUpdatedParams(pinned);
            this.fullWidthCellRendererParamsBySection[section] = params;

            const renderer = this.fullWidthCellRenderersBySection[section];
            if (renderer?.refresh && !renderer.refresh(params)) {
                refreshed = false;
            }
        }

        this.fullWidthCellRenderer = this.fullWidthCellRenderersBySection.center ?? null;
        this.fullWidthCellRendererParams = this.fullWidthCellRendererParamsBySection.center;
        return refreshed;
    }

    private getAllFullWidthCellRenderers(): (ICellRendererComp | null | undefined)[] {
        if (this.rowCtrl.isEmbeddedFullWidth) {
            const { left, center, right } = this.fullWidthCellRenderersBySection;
            return [left, center, right].filter((r): r is ICellRendererComp => r != null);
        }
        return this.fullWidthCellRenderer ? [this.fullWidthCellRenderer] : [];
    }

    private getPrimaryFullWidthCellRendererParams(): ICellRendererParams | undefined {
        return this.fullWidthCellRendererParams ?? this.fullWidthCellRendererParamsBySection.center;
    }

    private getFullWidthCellRendererParamsForPinned(pinned: ColumnPinnedType): ICellRendererParams | undefined {
        return this.fullWidthCellRendererParamsBySection[this.getEmbeddedSectionForPinned(pinned)];
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
        const pinned = cellCtrl.column.getPinned();
        let parent: HTMLElement | null | undefined;
        if (pinned === 'left') {
            parent = this.ePinnedLeftCells;
        } else if (pinned === 'right') {
            parent = this.ePinnedRightCells;
        } else {
            parent = this.eScrollingCells;
        }
        const eParent = parent ?? this.getGui();
        const cellComp = new CellComp(this.beans, cellCtrl, this.rowCtrl.printLayout, eParent, editing);
        this.cellComps.set(cellCtrl.instanceId, cellComp);
        eParent.appendChild(cellComp.getGui());
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

    private setEmbeddedFullWidthRowComp(
        section: HorizontalSection,
        fullWidthRowComponent: ICellRendererComp,
        params: ICellRendererParams
    ): void {
        this.fullWidthCellRenderersBySection[section] = fullWidthRowComponent;
        this.fullWidthCellRendererParamsBySection[section] = params;

        if (section === 'center') {
            this.fullWidthCellRenderer = fullWidthRowComponent;
            this.fullWidthCellRendererParams = params;
        }

        this.addDestroyFunc(() => {
            this.fullWidthCellRenderersBySection[section] = this.beans.context.destroyBean(
                this.fullWidthCellRenderersBySection[section]
            );
            this.fullWidthCellRendererParamsBySection[section] = undefined;
            if (section === 'center') {
                this.fullWidthCellRenderer = null;
                this.fullWidthCellRendererParams = undefined;
            }
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
