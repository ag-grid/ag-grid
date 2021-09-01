import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ColumnModel } from '../columns/columnModel';
import { Autowired, PostConstruct } from '../context/context';
import { HeaderContainer } from './headerContainer';
import { Events } from '../events';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { GridApi } from '../gridApi';
import { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import { Constants } from '../constants/constants';
import { addOrRemoveCssClass, setDisplayed } from '../utils/dom';
import { ManagedFocusFeature } from '../widgets/managedFocusFeature';
import { HeaderNavigationService, HeaderNavigationDirection } from './header/headerNavigationService';
import { exists } from '../utils/generic';
import { PinnedWidthService } from "../gridBodyComp/pinnedWidthService";
import { CenterWidthFeature } from "../gridBodyComp/centerWidthFeature";
import { CtrlsService } from "../ctrlsService";
import { KeyCode } from '../constants/keyCode';
import { FocusService } from '../focusService';
import { GridHeaderCtrl, IGridHeaderComp } from './gridHeaderCtrl';

export class GridHeaderComp extends Component {

    private static TEMPLATE = /* html */
        `<div class="ag-header" role="presentation" unselectable="on">
            <div class="ag-pinned-left-header" ref="ePinnedLeftHeader" role="presentation"></div>
            <div class="ag-header-viewport" ref="eHeaderViewport" role="presentation">
                <div class="ag-header-container" ref="eHeaderContainer" role="rowgroup"></div>
            </div>
            <div class="ag-pinned-right-header" ref="ePinnedRightHeader" role="presentation"></div>
        </div>`;

    @RefSelector('ePinnedLeftHeader') private ePinnedLeftHeader: HTMLElement;
    @RefSelector('ePinnedRightHeader') private ePinnedRightHeader: HTMLElement;
    @RefSelector('eHeaderContainer') private eHeaderContainer: HTMLElement;
    @RefSelector('eHeaderViewport') private eHeaderViewport: HTMLElement;

    constructor() {
        super(GridHeaderComp.TEMPLATE);
    }

    @PostConstruct
    private postConstruct(): void {

        const compProxy: IGridHeaderComp = {
            addOrRemoveCssClass: (cssClassName, on) => this.addOrRemoveCssClass(cssClassName, on),
            addOrRemoveLeftCssClass: (cssClassName, on) => addOrRemoveCssClass(this.ePinnedLeftHeader, cssClassName, on),
            addOrRemoveRightCssClass: (cssClassName, on) => addOrRemoveCssClass(this.ePinnedRightHeader, cssClassName, on),
            setCenterWidth: width => this.eHeaderContainer.style.width = width,
            setHeightAndMinHeight: height => {
                this.getGui().style.height = height;
                this.getGui().style.minHeight = height;
            },
            setCenterTransform: pos => this.eHeaderContainer.style.transform = pos
        };

        const ctrl = this.createManagedBean(new GridHeaderCtrl());
        ctrl.setComp(compProxy, this.getGui(), this.getFocusableElement());

        this.createManagedBean(new HeaderContainer(this.eHeaderContainer, this.eHeaderViewport, null));
        this.createManagedBean(new HeaderContainer(this.ePinnedLeftHeader, null, Constants.PINNED_LEFT));
        this.createManagedBean(new HeaderContainer(this.ePinnedRightHeader, null, Constants.PINNED_RIGHT));
    }
}
