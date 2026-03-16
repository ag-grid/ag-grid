import { _ensureDomOrder } from '../agStack/utils/dom';
import { BeanStub } from '../context/beanStub';
import type { ElementParams } from '../utils/element';
import { _createElement } from '../utils/element';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { HeaderRowComp } from './row/headerRowComp';
import type { HeaderRowCtrl, HeaderRowCtrlInstanceId } from './row/headerRowCtrl';
import { HeaderRowsCtrl } from './rowContainer/headerRowsCtrl';
import type { IHeaderRowsComp } from './rowContainer/headerRowsCtrl';

const HeaderWrapperElement: ElementParams = {
    tag: 'div',
    cls: 'ag-header',
    attrs: { role: 'presentation' },
};

export class GridHeaderFeature extends BeanStub {
    private headerRowComps: { [ctrlId: HeaderRowCtrlInstanceId]: HeaderRowComp } = {};
    private gridHeaderCtrl: GridHeaderCtrl | undefined;
    private readonly eHeaderWrapper: HTMLDivElement;

    constructor(
        private readonly eTopSection: HTMLElement,
        private readonly eGridViewport: HTMLElement
    ) {
        super();
        this.eHeaderWrapper = _createElement(HeaderWrapperElement);
    }

    public postConstruct(): void {
        // Prepend .ag-header as the first child of eTop
        this.eTopSection.prepend(this.eHeaderWrapper);

        const compProxy: IGridHeaderComp = {
            toggleCss: (cssClassName, on) => this.eHeaderWrapper.classList.toggle(cssClassName, on),
            setHeightAndMinHeight: (height) => {
                const borderWidth = this.beans.environment.getHeaderRowBorderWidth();
                const heightWithBorder = height + borderWidth;
                this.eTopSection.style.setProperty('--ag-header-rows-height', `${heightWithBorder}px`);
                this.eHeaderWrapper.style.height = `${heightWithBorder}px`;
            },
        };
        const rowContainerCompProxy: IHeaderRowsComp = {
            setCtrls: (ctrls) => this.setCtrls(ctrls),
            setViewportScrollLeft: (_left) => {},
        };

        this.gridHeaderCtrl = this.createManagedBean(new GridHeaderCtrl());
        this.gridHeaderCtrl.setComp(compProxy, this.eHeaderWrapper);

        const rowContainerCtrl = this.createManagedBean(new HeaderRowsCtrl());
        rowContainerCtrl.setComp(rowContainerCompProxy, this.eHeaderWrapper, this.eGridViewport);
    }

    public override destroy(): void {
        this.setCtrls([]);
        this.gridHeaderCtrl = undefined;
        this.eTopSection.style.removeProperty('--ag-header-rows-height');
        this.eHeaderWrapper.remove();
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

        this.gridHeaderCtrl?.setHeaderRowFocusableElements(orderedGuis);

        for (const oldComp of Object.values(oldRowComps)) {
            this.destroyRowComp(oldComp);
        }
    }
}
