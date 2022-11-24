import { PostConstruct } from '../context/context';
import { Component } from '../widgets/component';
import { GridHeaderCtrl, IGridHeaderComp } from './gridHeaderCtrl';
import { HeaderRowContainerComp } from './rowContainer/headerRowContainerComp';

export class GridHeaderComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-header" role="presentation"/>`;

    constructor() {
        super(GridHeaderComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {

        const compProxy: IGridHeaderComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            setHeightAndMinHeight: height => {
                this.getGui().style.height = height;
                this.getGui().style.minHeight = height;
            }
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
