import { BeanStub } from '../context/beanStub';
import type { ElementParams } from '../utils/element';
import { _createElement } from '../utils/element';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import { HeaderRowsComp } from './rowContainer/headerRowsComp';

const HeaderWrapperElement: ElementParams = {
    tag: 'div',
    cls: 'ag-header',
    attrs: { role: 'presentation' },
};

export class GridHeaderComp extends BeanStub {
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

        this.gridHeaderCtrl = this.createManagedBean(new GridHeaderCtrl());
        this.gridHeaderCtrl.setComp(compProxy, this.eHeaderWrapper);

        this.createManagedBean(
            new HeaderRowsComp(this.eHeaderWrapper, this.eGridViewport, (elements) =>
                this.gridHeaderCtrl?.setHeaderRowFocusableElements(elements)
            )
        );
    }

    public override destroy(): void {
        this.gridHeaderCtrl = undefined;
        this.eTopSection.style.removeProperty('--ag-header-rows-height');
        this.eHeaderWrapper.remove();
        super.destroy();
    }
}
