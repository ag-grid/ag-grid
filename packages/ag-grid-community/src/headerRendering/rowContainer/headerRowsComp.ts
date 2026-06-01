import { _ensureDomOrder } from 'ag-stack';

import { BeanStub } from '../../context/beanStub';
import { HeaderRowComp } from '../row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from '../row/headerRowCtrl';
import type { IHeaderRowsComp } from './headerRowContainerCtrl';
import { HeaderRowContainerCtrl } from './headerRowContainerCtrl';

export class HeaderRowsComp extends BeanStub {
    private headerRowComps: { [ctrlId: HeaderRowCtrlInstanceId]: HeaderRowComp } = {};

    constructor(
        private readonly eHeaderWrapper: HTMLElement,
        private readonly eGridViewport: HTMLElement,
        private readonly setHeaderRowFocusableElements: (elements: HTMLElement[]) => void
    ) {
        super();
    }

    public postConstruct(): void {
        const compProxy: IHeaderRowsComp = {
            setCtrls: (ctrls) => this.setCtrls(ctrls),
            setViewportScrollLeft: (_left) => {},
        };

        const rowContainerCtrl = this.createManagedBean(new HeaderRowContainerCtrl());
        rowContainerCtrl.setComp(compProxy, this.eHeaderWrapper, this.eGridViewport);
    }

    public override destroy(): void {
        this.setCtrls([]);
        super.destroy();
    }

    private destroyRowComp(rowComp: HeaderRowComp): void {
        this.destroyBean(rowComp);
        rowComp.getGui().remove();
    }

    private setCtrls(ctrls: HeaderRowCtrl[]): void {
        const oldRowComps = this.headerRowComps;
        this.headerRowComps = {};

        let previous: HTMLElement | null = null;
        const orderedGuis: HTMLElement[] = [];

        for (const ctrl of ctrls) {
            const ctrlId = ctrl.instanceId;
            const existingComp = oldRowComps[ctrlId];
            delete oldRowComps[ctrlId];

            const rowComp = existingComp ?? this.createBean(new HeaderRowComp(ctrl));
            this.headerRowComps[ctrlId] = rowComp;

            const eGui = rowComp.getGui();
            orderedGuis.push(eGui);

            if (eGui.parentElement !== this.eHeaderWrapper) {
                this.eHeaderWrapper.appendChild(eGui);
            }
            _ensureDomOrder(this.eHeaderWrapper, eGui, previous);
            previous = eGui;
        }

        this.setHeaderRowFocusableElements(orderedGuis);

        for (const oldComp of Object.values(oldRowComps)) {
            this.destroyRowComp(oldComp);
        }
    }
}
