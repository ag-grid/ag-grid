import { Constants } from '../constants/constants';
import { PostConstruct } from '../context/context';
import { addOrRemoveCssClass } from '../utils/dom';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { GridHeaderCtrl, IGridHeaderComp } from './gridHeaderCtrl';
import { HeaderContainer } from './headerContainer';

export class GridHeaderComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-header" role="presentation" unselectable="on"/>`;

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

        const addContainer = (container: HeaderContainer) => {
            this.createManagedBean(container);
            this.appendChild(container);
        };

        addContainer(new HeaderContainer(Constants.PINNED_LEFT));
        addContainer(new HeaderContainer(null));
        addContainer(new HeaderContainer(Constants.PINNED_RIGHT));
    }
}
