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
    private pinnedTopHeaderRowsSource: PinnedRowContainerRendererSource | undefined;
    private initialised = false;

    constructor() {
        super(GridHeaderElement);
    }

    public postConstruct(): void {
        this.initialise();
    }

    private resolvePinnedTopCenterHost(): HTMLElement {
        return this.beans.ctrlsSvc.get('pinnedTopCenter')?.eContainer ?? this.getGui().parentElement ?? this.getGui();
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
        this.eHeaderHost = this.resolvePinnedTopCenterHost();
        this.ePinnedTopRowsHost = this.eHeaderHost.parentElement ?? this.eHeaderHost;
        const eGridViewport = this.resolveGridViewport(this.eHeaderHost);

        eGui.remove();
        this.tryRegisterPinnedTopHeaderSource();
        this.beans.ctrlsSvc.whenReady(this, () => this.tryRegisterPinnedTopHeaderSource());
        this.initialised = true;
        const eHeaderHost = this.eHeaderHost;
        const ePinnedTopRowsHost = this.ePinnedTopRowsHost;
        if (!eHeaderHost || !ePinnedTopRowsHost) {
            return;
        }

        const compProxy: IGridHeaderComp = {
            toggleCss: (cssClassName, on) => eHeaderHost.classList.toggle(cssClassName, on),
            setHeightAndMinHeight: (height) => {
                ePinnedTopRowsHost.style.setProperty('--ag-header-rows-height', height);
            },
        };

        const ctrl = this.createManagedBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, eHeaderHost, eHeaderHost);

        const rowContainerCompProxy: IHeaderRowContainerComp = {
            setCtrls: (ctrls) => this.setCtrls(ctrls),
            setViewportScrollLeft: (_left) => {},
        };

        const rowContainerCtrl = this.createManagedBean(new HeaderRowContainerCtrl());
        rowContainerCtrl.setComp(rowContainerCompProxy, eHeaderHost, eGridViewport);
    }

    private tryRegisterPinnedTopHeaderSource(): void {
        if (this.pinnedTopHeaderRowsSource) {
            return;
        }

        const pinnedRowContainerRendererFeature = this.beans.ctrlsSvc
            .get('gridBodyCtrl')
            ?.getPinnedRowContainerRendererFeature();
        if (!pinnedRowContainerRendererFeature) {
            return;
        }

        this.pinnedTopHeaderRowsSource = pinnedRowContainerRendererFeature.registerSource({
            id: 'header-rows',
            section: 'top',
            stream: 'center',
            lane: 'edge',
            order: 0,
        });

        if (this.orderedHeaderRowGuis.length) {
            this.pinnedTopHeaderRowsSource.setRows(this.orderedHeaderRowGuis);
        }
    }

    public override destroy(): void {
        this.setCtrls([]);
        this.pinnedTopHeaderRowsSource?.destroy();
        this.pinnedTopHeaderRowsSource = undefined;
        this.ePinnedTopRowsHost?.style.removeProperty('--ag-header-rows-height');
        super.destroy();
    }

    private destroyRowComp(rowComp: HeaderRowComp): void {
        this.destroyBean(rowComp);
        rowComp.getGui().remove();
    }

    private setCtrls(ctrls: HeaderRowCtrl[]): void {
        const oldRowComps = this.headerRowComps;
        this.headerRowComps = {};

        const orderedGuis: HTMLElement[] = [];

        for (const ctrl of ctrls) {
            const ctrlId = ctrl.instanceId;
            const existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ?? this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;

            const eGui = rowComp.getGui();
            orderedGuis.push(eGui);
        }

        this.orderedHeaderRowGuis = orderedGuis;
        this.pinnedTopHeaderRowsSource?.setRows(orderedGuis);

        for (const oldComp of Object.values(oldRowComps)) {
            this.destroyRowComp(oldComp);
        }
    }
}
export const GridHeaderSelector: ComponentSelector = {
    selector: 'AG-HEADER-ROOT',
    component: GridHeaderComp,
};
