import type { ElementParams } from '../utils/dom';
import type { ComponentSelector } from '../widgets/component';
import { Component } from '../widgets/component';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import { HeaderRowContainerComp } from './rowContainer/headerRowContainerComp';

const GridHeaderElement: ElementParams = { tag: 'div', cls: 'ag-header', role: 'presentation' };
export class GridHeaderComp extends Component {
    constructor() {
        super(GridHeaderElement);
    }

    public postConstruct(): void {
        const compProxy: IGridHeaderComp = {
            toggleCss: (cssClassName, on) => this.toggleCss(cssClassName, on),
            setHeightAndMinHeight: (height) => {
                this.getGui().style.height = height;
                this.getGui().style.minHeight = height;
            },
        };

        const ctrl = this.createManagedBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.getFocusableElement());

        const addContainer = (container: HeaderRowContainerComp) => {
            this.createManagedBean(container);
            this.appendChild(container);
        };

        addContainer(new HeaderRowContainerComp('left'));
        addContainer(new HeaderRowContainerComp(null));
        addContainer(new HeaderRowContainerComp('right'));
    }
}
export const GridHeaderSelector: ComponentSelector = {
    selector: 'AG-HEADER-ROOT',
    component: GridHeaderComp,
};
