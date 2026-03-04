import { BeanStub } from '../context/beanStub';
import type {
    IPinnedRowContainerRendererFeature,
    PinnedRowContainerRendererSource,
} from '../gridBodyComp/pinnedRowContainerRendererFeature';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { HeaderRowComp } from './row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from './row/headerRowCtrl';
import { HeaderRowContainerCtrl } from './rowContainer/headerRowContainerCtrl';
import type { IHeaderRowContainerComp } from './rowContainer/headerRowContainerCtrl';

export class GridHeaderFeature extends BeanStub {
    private headerRowComps: { [ctrlId: HeaderRowCtrlInstanceId]: HeaderRowComp } = {};
    private pinnedTopHeaderRowsSource: PinnedRowContainerRendererSource | undefined;

    constructor(
        private readonly eHeaderHost: HTMLElement,
        private readonly ePinnedTopRowsHost: HTMLElement,
        private readonly eGridViewport: HTMLElement,
        private readonly pinnedRowContainerRendererFeature: IPinnedRowContainerRendererFeature
    ) {
        super();
    }

    public postConstruct(): void {
        this.pinnedTopHeaderRowsSource = this.pinnedRowContainerRendererFeature.registerSource({
            id: 'header-rows',
            section: 'top',
            stream: 'center',
            lane: 'edge',
            order: 0,
        });

        const compProxy: IGridHeaderComp = {
            toggleCss: (cssClassName, on) => this.eHeaderHost.classList.toggle(cssClassName, on),
            setHeightAndMinHeight: (height) =>
                this.ePinnedTopRowsHost.style.setProperty('--ag-header-rows-height', height),
        };
        const rowContainerCompProxy: IHeaderRowContainerComp = {
            setCtrls: (ctrls) => this.setCtrls(ctrls),
            setViewportScrollLeft: (_left) => {},
        };

        const ctrl = this.createManagedBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, this.eHeaderHost, this.eHeaderHost);

        const rowContainerCtrl = this.createManagedBean(new HeaderRowContainerCtrl());
        rowContainerCtrl.setComp(rowContainerCompProxy, this.eHeaderHost, this.eGridViewport);
    }

    public override destroy(): void {
        this.setCtrls([]);
        this.pinnedTopHeaderRowsSource?.destroy();
        this.pinnedTopHeaderRowsSource = undefined;
        this.ePinnedTopRowsHost.style.removeProperty('--ag-header-rows-height');
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
            orderedGuis.push(rowComp.getGui());
        }

        this.pinnedTopHeaderRowsSource?.setRows(orderedGuis);

        for (const oldComp of Object.values(oldRowComps)) {
            this.destroyRowComp(oldComp);
        }
    }
}
