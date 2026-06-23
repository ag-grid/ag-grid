import { _setAriaRowIndex, _setDomChildOrder } from 'ag-stack';

import { _createElement } from '../../utils/element';
import { _isHeaderFocusSuppressed } from '../../utils/gridFocus';
import { Component } from '../../widgets/component';
import type { AbstractHeaderCellComp } from '../cells/abstractCell/abstractHeaderCellComp';
import type { AbstractHeaderCellCtrl, HeaderCellCtrlInstanceId } from '../cells/abstractCell/abstractHeaderCellCtrl';
import { HeaderCellComp } from '../cells/column/headerCellComp';
import type { HeaderCellCtrl } from '../cells/column/headerCellCtrl';
import { HeaderGroupCellComp } from '../cells/columnGroup/headerGroupCellComp';
import type { HeaderGroupCellCtrl } from '../cells/columnGroup/headerGroupCellCtrl';
import { HeaderFilterCellComp } from '../cells/floatingFilter/headerFilterCellComp';
import type { HeaderFilterCellCtrl } from '../cells/floatingFilter/headerFilterCellCtrl';
import type { PinnedSectionWidthsCache } from '../headerUtils';
import { partitionByPinned, updatePinnedSectionWidths } from '../headerUtils';
import type { HeaderRowCtrl, IHeaderRowComp } from './headerRowCtrl';

export type HeaderRowType = 'group' | 'column' | 'filter';

export class HeaderRowComp extends Component {
    private headerComps: { [key: HeaderCellCtrlInstanceId]: AbstractHeaderCellComp<AbstractHeaderCellCtrl> } = {};
    private readonly ePinnedLeftCells: HTMLElement;
    private readonly ePinnedLeftWrapper: HTMLElement;
    private readonly eScrollingCells: HTMLElement;
    private readonly ePinnedRightCells: HTMLElement;
    private readonly ePinnedRightWrapper: HTMLElement;
    private readonly pinnedWidthsCache: PinnedSectionWidthsCache = {
        pinnedLeftWidth: undefined,
        centerWidth: undefined,
        pinnedRightWidth: undefined,
    };

    constructor(private readonly ctrl: HeaderRowCtrl) {
        super({ tag: 'div', cls: ctrl.headerRowClass, role: 'row' });

        this.ePinnedLeftCells = _createElement({
            tag: 'div',
            cls: 'ag-grid-pinned-left-cells',
            role: 'presentation',
        });
        this.ePinnedLeftWrapper = _createElement({
            tag: 'div',
            cls: 'ag-grid-container-wrapper',
            role: 'presentation',
        });
        this.ePinnedLeftCells.appendChild(this.ePinnedLeftWrapper);

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
        this.ePinnedRightWrapper = _createElement({
            tag: 'div',
            cls: 'ag-grid-container-wrapper',
            role: 'presentation',
        });
        this.ePinnedRightCells.appendChild(this.ePinnedRightWrapper);

        this.getGui().append(this.ePinnedLeftCells, this.eScrollingCells, this.ePinnedRightCells);
    }

    public postConstruct(): void {
        const eGui = this.getGui();
        const updateTabIndex = () => {
            if (_isHeaderFocusSuppressed(this.beans)) {
                eGui.removeAttribute('tabindex');
            } else {
                eGui.setAttribute('tabindex', String(this.gos.get('tabIndex')));
            }
        };
        updateTabIndex();
        this.addManagedPropertyListeners(['suppressHeaderFocus'], updateTabIndex);
        this.setRowIndex(this.ctrl.getAriaRowIndex());

        const compProxy: IHeaderRowComp = {
            setHeight: (height) => (this.getGui().style.height = height),
            setTop: (top) => (this.getGui().style.top = top),
            setHeaderCtrls: (ctrls, forceOrder) => this.setHeaderCtrls(ctrls, forceOrder),
            refreshPinnedCellGroupWidths: () => this.updatePinnedCellGroupWidths(),
            setWidth: (width) => (this.getGui().style.width = width),
            setRowIndex: (rowIndex) => this.setRowIndex(rowIndex),
        };

        this.ctrl.setComp(compProxy, undefined);
    }

    public override destroy(): void {
        this.setHeaderCtrls([], false);
        super.destroy();
    }

    private setHeaderCtrls(ctrls: AbstractHeaderCellCtrl[], forceOrder: boolean): void {
        if (!this.isAlive()) {
            return;
        }

        const oldComps = this.headerComps;
        this.headerComps = {};

        for (const ctrl of ctrls) {
            const id = ctrl.instanceId;
            let comp = oldComps[id];
            delete oldComps[id];

            comp ??= this.createHeaderComp(ctrl);

            const parent = this.getHeaderCellGroup(ctrl);
            if (comp.getGui().parentElement !== parent) {
                parent.appendChild(comp.getGui());
            }
            this.headerComps[id] = comp;
        }

        Object.values(oldComps).forEach((comp: AbstractHeaderCellComp<AbstractHeaderCellCtrl>) => {
            comp.getGui().remove();
            this.destroyBean(comp);
        });

        this.updatePinnedCellGroupWidths();

        if (forceOrder) {
            const sortByLeft = (
                a: AbstractHeaderCellComp<AbstractHeaderCellCtrl>,
                b: AbstractHeaderCellComp<AbstractHeaderCellCtrl>
            ) => a.getCtrl().column.getLeft()! - b.getCtrl().column.getLeft()!;

            if (this.gos.get('domLayout') === 'print') {
                const comps = Object.values(this.headerComps).sort(sortByLeft);
                _setDomChildOrder(
                    this.eScrollingCells,
                    comps.map((c) => c.getGui())
                );
                return;
            }

            const comps = Object.values(this.headerComps);
            const { left, center, right } = partitionByPinned(comps, (c) => c.getCtrl().column.getPinned());

            left.sort(sortByLeft);
            center.sort(sortByLeft);
            right.sort(sortByLeft);

            _setDomChildOrder(
                this.ePinnedLeftWrapper,
                left.map((c) => c.getGui())
            );
            _setDomChildOrder(
                this.eScrollingCells,
                center.map((c) => c.getGui())
            );
            _setDomChildOrder(
                this.ePinnedRightWrapper,
                right.map((c) => c.getGui())
            );
        }
    }

    private getHeaderCellGroup(ctrl: AbstractHeaderCellCtrl): HTMLElement {
        if (this.gos.get('domLayout') === 'print') {
            return this.eScrollingCells;
        }

        const pinned = ctrl.column.getPinned();
        if (pinned === 'left') {
            return this.ePinnedLeftWrapper;
        }
        if (pinned === 'right') {
            return this.ePinnedRightWrapper;
        }
        return this.eScrollingCells;
    }

    private updatePinnedCellGroupWidths(): void {
        const isPrint = this.gos.get('domLayout') === 'print';
        updatePinnedSectionWidths(
            this.beans.visibleCols,
            isPrint,
            {
                ePinnedLeft: this.ePinnedLeftCells,
                eScrolling: this.eScrollingCells,
                ePinnedRight: this.ePinnedRightCells,
            },
            this.pinnedWidthsCache
        );
    }

    private setRowIndex(ariaRowIndex: number): void {
        const eGui = this.getGui();
        _setAriaRowIndex(eGui, ariaRowIndex);
        eGui.classList.toggle('ag-header-row-not-first', ariaRowIndex !== 1);
    }

    private createHeaderComp(headerCtrl: AbstractHeaderCellCtrl): AbstractHeaderCellComp<AbstractHeaderCellCtrl> {
        let result: AbstractHeaderCellComp<AbstractHeaderCellCtrl>;

        switch (this.ctrl.type) {
            case 'group':
                result = new HeaderGroupCellComp(headerCtrl as HeaderGroupCellCtrl);
                break;
            case 'filter':
                result = new HeaderFilterCellComp(headerCtrl as HeaderFilterCellCtrl);
                break;
            default:
                result = new HeaderCellComp(headerCtrl as HeaderCellCtrl);
                break;
        }

        this.createBean(result);
        result.setParentComponent(this);

        return result;
    }
}
