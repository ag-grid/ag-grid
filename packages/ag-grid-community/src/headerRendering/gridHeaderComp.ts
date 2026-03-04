import { _ensureDomOrder, _requestAnimationFrame } from '../agStack/utils/dom';
import type { PinnedRowContainerRendererSource } from '../gridBodyComp/pinnedRowContainerRendererFeature';
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
    private orderedHeaderRowGuis: HTMLElement[] = [];
    private eHeaderHost: HTMLElement | null = null;
    private ePinnedTopRowsHost: HTMLElement | null = null;
    private flattenedHeaderRowsSource: PinnedRowContainerRendererSource | undefined;
    private isFlattened = false;
    private initialised = false;

    constructor() {
        super(GridHeaderElement);
    }

    public postConstruct(): void {
        this.initialise();
    }

    private resolveFlattenedHost(): HTMLElement | null {
        const parentComp = this.getParentComponent<Component>();
        return parentComp?.getGui().querySelector('.ag-grid-pinned-top-rows-container') ?? null;
    }

    private resolveGridViewport(host: HTMLElement): HTMLElement {
        return (
            this.beans.ctrlsSvc.get('gridBodyCtrl')?.eGridViewport ??
            (host.closest('.ag-grid-viewport') as HTMLElement | null) ??
            host
        );
    }

    private initialise(): void {
        if (!this.isAlive() || this.initialised) {
            return;
        }

        const eGui = this.getGui();
        const flattenedHost = this.resolveFlattenedHost();
        const eHeaderHost = flattenedHost ?? eGui;
        const eGridViewport = this.resolveGridViewport(eHeaderHost);

        if (flattenedHost) {
            this.eHeaderHost = eHeaderHost;
            this.ePinnedTopRowsHost = flattenedHost.parentElement ?? flattenedHost;
            this.isFlattened = true;
            this.removeFlattenedGui();
            this.tryRegisterFlattenedSource();
            this.beans.ctrlsSvc.whenReady(this, () => this.tryRegisterFlattenedSource());
        } else {
            this.eHeaderHost = eHeaderHost;
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
        const eScrollViewport = this.isFlattened ? eGridViewport : this.eHeaderHost!;
        rowContainerCtrl.setComp(rowContainerCompProxy, this.eHeaderHost!, eScrollViewport);
    }

    private tryRegisterFlattenedSource(): void {
        if (!this.isFlattened || this.flattenedHeaderRowsSource) {
            return;
        }

        const pinnedRowContainerRendererFeature = this.beans.ctrlsSvc
            .get('gridBodyCtrl')
            ?.getPinnedRowContainerRendererFeature();
        if (!pinnedRowContainerRendererFeature) {
            return;
        }

        this.flattenedHeaderRowsSource = pinnedRowContainerRendererFeature.registerSource({
            id: 'header-rows',
            section: 'top',
            stream: 'center',
            lane: 'edge',
            order: 0,
        });

        if (this.orderedHeaderRowGuis.length) {
            this.flattenedHeaderRowsSource.setRows(this.orderedHeaderRowGuis);
        }
    }

    private removeFlattenedGui(): void {
        const eGui = this.getGui();
        if (eGui.parentElement) {
            eGui.remove();
            return;
        }
        _requestAnimationFrame(this.beans, () => {
            if (this.isAlive() && this.isFlattened && eGui.parentElement) {
                eGui.remove();
            }
        });
    }

    public override destroy(): void {
        this.setCtrls([]);
        this.flattenedHeaderRowsSource?.destroy();
        this.flattenedHeaderRowsSource = undefined;
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
        const orderedGuis: HTMLElement[] = [];
        const eHeader = this.eHeaderHost!;

        for (const ctrl of ctrls) {
            const ctrlId = ctrl.instanceId;
            const existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ?? this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;

            const eGui = rowComp.getGui();
            if (!this.isFlattened) {
                if (eGui.parentElement !== eHeader) {
                    eHeader.appendChild(eGui);
                }
                if (prevGui) {
                    _ensureDomOrder(eHeader, eGui, prevGui);
                }
            }
            prevGui = eGui;
            orderedGuis.push(eGui);
        }

        this.orderedHeaderRowGuis = orderedGuis;

        if (this.isFlattened) {
            this.flattenedHeaderRowsSource?.setRows(orderedGuis);
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
