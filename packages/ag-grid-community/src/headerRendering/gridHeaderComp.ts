import { _ensureDomOrder } from '../agStack/utils/dom';
import type { ElementParams } from '../utils/element';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import { HeaderRowComp } from './row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from './row/headerRowCtrl';
import type { IHeaderRowContainerComp } from './rowContainer/headerRowContainerCtrl';
import { HeaderRowContainerCtrl } from './rowContainer/headerRowContainerCtrl';

const GridHeaderElement: ElementParams = { tag: 'div', cls: 'ag-header', role: 'rowgroup' };

class GridHeaderComp extends Component {
    private headerRowComps: { [ctrlId: HeaderRowCtrlInstanceId]: HeaderRowComp } = {};
    private eHeaderHost: HTMLElement | null = null;
    private ePinnedTopRowsHost: HTMLElement | null = null;
    private isFlattened = false;
    private initialised = false;

    constructor() {
        super(GridHeaderElement);
    }

    public postConstruct(): void {
        this.initialiseWhenAttached();
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

    private getFlattenedHostFromParent(): HTMLElement | null {
        const parentComp = this.getParentComponent<Component>();
        return parentComp?.getGui().querySelector('.ag-grid-pinned-top-rows-container') ?? null;
    }

    private initialiseWhenAttached(): void {
        if (!this.isAlive() || this.initialised) {
            return;
        }

        const eGui = this.getGui();
        const parent = eGui.parentElement ?? this.getFlattenedHostFromParent();
        if (!parent) {
            window.requestAnimationFrame(() => this.initialiseWhenAttached());
            return;
        }

        const eGridViewport =
            this.beans.ctrlsSvc.get('gridBodyCtrl')?.eGridViewport ?? this.getGridViewportFromParentChain(parent);

        if (parent.classList.contains('ag-grid-pinned-top-rows-container')) {
            if (!eGridViewport) {
                window.requestAnimationFrame(() => this.initialiseWhenAttached());
                return;
            }
            this.eHeaderHost = parent;
            this.ePinnedTopRowsHost = parent.parentElement ?? parent;
            this.isFlattened = true;
            eGui.remove();
        } else {
            this.eHeaderHost = eGui;
        }
        this.initialised = true;

        const compProxy: IGridHeaderComp = {
            toggleCss: (cssClassName, on) => this.eHeaderHost?.classList.toggle(cssClassName, on),
            setHeightAndMinHeight: (height) => {
                if (!this.eHeaderHost) {
                    return;
                }

                if (this.isFlattened) {
                    this.ePinnedTopRowsHost?.style.setProperty('--ag-header-rows-height', height);
                } else {
                    this.eHeaderHost.style.height = height;
                    this.eHeaderHost.style.minHeight = height;
                }
            },
        };

        const ctrl = this.createManagedBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, this.eHeaderHost!, this.eHeaderHost!);

        const rowContainerCompProxy: IHeaderRowContainerComp = {
            setCtrls: (ctrls) => this.setCtrls(ctrls),
            setViewportScrollLeft: (left) => {
                if (!this.isFlattened && this.eHeaderHost) {
                    this.eHeaderHost.scrollLeft = left;
                }
            },
        };

        const rowContainerCtrl = this.createManagedBean(new HeaderRowContainerCtrl());
        const eScrollViewport = this.isFlattened ? eGridViewport! : this.eHeaderHost!;
        rowContainerCtrl.setComp(rowContainerCompProxy, this.eHeaderHost!, eScrollViewport);
    }

    public override destroy(): void {
        this.setCtrls([]);
        if (this.isFlattened) {
            this.ePinnedTopRowsHost?.style.removeProperty('--ag-header-rows-height');
        }
        super.destroy();
    }

    private destroyRowComp(rowComp: HeaderRowComp): void {
        this.destroyBean(rowComp);
        rowComp.getGui().remove();
    }

    private setCtrls(ctrls: HeaderRowCtrl[]): void {
        const oldRowComps = this.headerRowComps;
        this.headerRowComps = {};

        let prevGui: HTMLElement | undefined;
        const eHeader = this.eHeaderHost!;

        for (const ctrl of ctrls) {
            const ctrlId = ctrl.instanceId;
            const existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ?? this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;

            const eGui = rowComp.getGui();
            if (eGui.parentElement !== eHeader) {
                eHeader.appendChild(eGui);
            }
            if (prevGui) {
                _ensureDomOrder(eHeader, eGui, prevGui);
            }
            prevGui = eGui;
        }

        for (const oldComp of Object.values(oldRowComps)) {
            this.destroyRowComp(oldComp);
        }
    }
}
export const GridHeaderSelector: ComponentSelector = {
    selector: 'AG-HEADER-ROOT',
    component: GridHeaderComp,
};
