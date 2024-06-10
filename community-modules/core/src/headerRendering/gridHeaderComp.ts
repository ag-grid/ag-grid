import type { ComponentClass } from '../widgets/component';
import { Component } from '../widgets/component';
import type { IGridHeaderComp } from './gridHeaderCtrl';
import { GridHeaderCtrl } from './gridHeaderCtrl';
import { HeaderRowContainerComp } from './rowContainer/headerRowContainerComp';

export class GridHeaderComp extends Component {
    constructor() {
        super(/* html */ `<div class="ag-header" role="presentation"/>`);
    }

    public postConstruct(): void {
        const compProxy: IGridHeaderComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
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
export const GridHeaderCompClass: ComponentClass = {
    selector: 'AG-HEADER-ROOT',
    class: GridHeaderComp,
};
