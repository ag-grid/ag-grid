import { _setAriaRowIndex } from '../../agStack/utils/aria';
import { _setDomChildOrder } from '../../agStack/utils/dom';
import { _createElement } from '../../utils/element';
import { Component } from '../../widgets/component';
import type { AbstractHeaderCellComp } from '../cells/abstractCell/abstractHeaderCellComp';
import type { AbstractHeaderCellCtrl, HeaderCellCtrlInstanceId } from '../cells/abstractCell/abstractHeaderCellCtrl';
import { HeaderCellComp } from '../cells/column/headerCellComp';
import type { HeaderCellCtrl } from '../cells/column/headerCellCtrl';
import { HeaderGroupCellComp } from '../cells/columnGroup/headerGroupCellComp';
import type { HeaderGroupCellCtrl } from '../cells/columnGroup/headerGroupCellCtrl';
import { HeaderFilterCellComp } from '../cells/floatingFilter/headerFilterCellComp';
import type { HeaderFilterCellCtrl } from '../cells/floatingFilter/headerFilterCellCtrl';
import type { HeaderRowCtrl, IHeaderRowComp } from './headerRowCtrl';

export type HeaderRowType = 'group' | 'column' | 'filter';

export class HeaderRowComp extends Component {
    private headerComps: { [key: HeaderCellCtrlInstanceId]: AbstractHeaderCellComp<AbstractHeaderCellCtrl> } = {};
    private readonly ePinnedLeftCells: HTMLElement;
    private readonly eScrollingCells: HTMLElement;
    private readonly ePinnedRightCells: HTMLElement;

    constructor(private readonly ctrl: HeaderRowCtrl) {
        super({ tag: 'div', cls: ctrl.headerRowClass, role: 'row' });

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
        this.getGui().append(this.ePinnedLeftCells, this.eScrollingCells, this.ePinnedRightCells);
    }

    public postConstruct(): void {
        const eGui = this.getGui();
        eGui.setAttribute('tabindex', String(this.gos.get('tabIndex')));
        _setAriaRowIndex(this.getGui(), this.ctrl.getAriaRowIndex());

        const compProxy: IHeaderRowComp = {
            setHeight: (height) => (this.getGui().style.height = height),
            setTop: (top) => (this.getGui().style.top = top),
            setHeaderCtrls: (ctrls, forceOrder) => this.setHeaderCtrls(ctrls, forceOrder),
            refreshPinnedCellGroupWidths: () => this.refreshPinnedCellGroupWidths(),
            setWidth: (width) => (this.getGui().style.width = width),
            setRowIndex: (rowIndex) => _setAriaRowIndex(this.getGui(), rowIndex),
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

            if (comp == null) {
                comp = this.createHeaderComp(ctrl);
            }

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

            const leftComps: AbstractHeaderCellComp<AbstractHeaderCellCtrl>[] = [];
            const centerComps: AbstractHeaderCellComp<AbstractHeaderCellCtrl>[] = [];
            const rightComps: AbstractHeaderCellComp<AbstractHeaderCellCtrl>[] = [];
            for (const comp of Object.values(this.headerComps)) {
                const pinned = comp.getCtrl().column.getPinned();
                if (pinned === 'left') {
                    leftComps.push(comp);
                } else if (pinned === 'right') {
                    rightComps.push(comp);
                } else {
                    centerComps.push(comp);
                }
            }

            leftComps.sort(sortByLeft);
            centerComps.sort(sortByLeft);
            rightComps.sort(sortByLeft);

            _setDomChildOrder(
                this.ePinnedLeftCells,
                leftComps.map((c) => c.getGui())
            );
            _setDomChildOrder(
                this.eScrollingCells,
                centerComps.map((c) => c.getGui())
            );
            _setDomChildOrder(
                this.ePinnedRightCells,
                rightComps.map((c) => c.getGui())
            );
        }
    }

    private getHeaderCellGroup(ctrl: AbstractHeaderCellCtrl): HTMLElement {
        if (this.gos.get('domLayout') === 'print') {
            return this.eScrollingCells;
        }

        const pinned = ctrl.column.getPinned();
        if (pinned === 'left') {
            return this.ePinnedLeftCells;
        }
        if (pinned === 'right') {
            return this.ePinnedRightCells;
        }
        return this.eScrollingCells;
    }

    private updatePinnedCellGroupWidths(): void {
        const {
            gos,
            ePinnedLeftCells,
            ePinnedRightCells,
            beans: { visibleCols },
        } = this;
        if (gos.get('domLayout') === 'print') {
            ePinnedLeftCells.style.width = '0px';
            ePinnedRightCells.style.width = '0px';
            ePinnedLeftCells.style.display = 'none';
            ePinnedRightCells.style.display = 'none';
            return;
        }

        const leftWidth = visibleCols.getLeftStickyColumnContainerWidth();
        const rightWidth = visibleCols.getRightStickyColumnContainerWidth();

        ePinnedLeftCells.style.width = `${leftWidth}px`;
        ePinnedRightCells.style.width = `${rightWidth}px`;
        ePinnedLeftCells.style.display = leftWidth > 0 ? '' : 'none';
        ePinnedRightCells.style.display = rightWidth > 0 ? '' : 'none';
    }

    private refreshPinnedCellGroupWidths(): void {
        this.updatePinnedCellGroupWidths();
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
