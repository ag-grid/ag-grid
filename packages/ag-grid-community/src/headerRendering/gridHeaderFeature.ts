import { BeanStub } from '../context/beanStub';
import type {
    IPinnedRowContainerRendererFeature,
    PinnedRowContainerRendererSource,
} from '../gridBodyComp/pinnedRowContainerRendererFeature';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { HeaderRowComp } from './row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from './row/headerRowCtrl';
import { HeaderRowsCtrl } from './rowContainer/headerRowsCtrl';
import type { IHeaderRowsComp } from './rowContainer/headerRowsCtrl';

export class GridHeaderFeature extends BeanStub {
    private headerRowComps: { [ctrlId: HeaderRowCtrlInstanceId]: HeaderRowComp } = {};
    private topSectionHeaderRowsSource: PinnedRowContainerRendererSource | undefined;
    private gridHeaderCtrl: GridHeaderCtrl | undefined;

    constructor(
        private readonly eTopSectionCenterHost: HTMLElement,
        private readonly eTopSectionWrapper: HTMLElement,
        private readonly eGridViewport: HTMLElement,
        private readonly pinnedRowContainerRendererFeature: IPinnedRowContainerRendererFeature
    ) {
        super();
    }

    public postConstruct(): void {
        this.topSectionHeaderRowsSource = this.pinnedRowContainerRendererFeature.registerSource({
            id: 'header-rows',
            section: 'top',
            stream: 'center',
            lane: 'edge',
        });

        const compProxy: IGridHeaderComp = {
            toggleCss: (cssClassName, on) => this.eTopSectionCenterHost.classList.toggle(cssClassName, on),
            setHeightAndMinHeight: (height) =>
                this.eTopSectionWrapper.style.setProperty('--ag-header-rows-height', height),
        };
        const rowContainerCompProxy: IHeaderRowsComp = {
            setCtrls: (ctrls) => this.setCtrls(ctrls),
            setViewportScrollLeft: (_left) => {},
        };

        this.gridHeaderCtrl = this.createManagedBean(new GridHeaderCtrl());
        this.gridHeaderCtrl.setComp(compProxy, this.eTopSectionCenterHost);

        const rowContainerCtrl = this.createManagedBean(new HeaderRowsCtrl());
        rowContainerCtrl.setComp(rowContainerCompProxy, this.eTopSectionCenterHost, this.eGridViewport);
    }

    public override destroy(): void {
        this.setCtrls([]);
        this.topSectionHeaderRowsSource?.destroy();
        this.topSectionHeaderRowsSource = undefined;
        this.gridHeaderCtrl = undefined;
        this.eTopSectionWrapper.style.removeProperty('--ag-header-rows-height');
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

        this.topSectionHeaderRowsSource?.setRows(orderedGuis);
        this.gridHeaderCtrl?.setHeaderRowFocusableElements(orderedGuis);

        for (const oldComp of Object.values(oldRowComps)) {
            this.destroyRowComp(oldComp);
        }
    }
}
