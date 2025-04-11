import type {
    ElementParams,
    GroupCellRendererParams,
    ICellRendererComp,
    IGroupCellRenderer,
    UserCompDetails,
} from 'ag-grid-community';
import { Component, RefPlaceholder, _setAriaRole, _setDisplayed } from 'ag-grid-community';

import { GroupCellRendererCtrl } from './groupCellRendererCtrl';

const GroupCellRendererElement: ElementParams = {
    tag: 'span',
    cls: 'ag-cell-wrapper',
    children: [
        { tag: 'span', ref: 'eExpanded', cls: 'ag-group-expanded ag-hidden' },
        { tag: 'span', ref: 'eContracted', cls: 'ag-group-contracted ag-hidden' },
        { tag: 'span', ref: 'eCheckbox', cls: 'ag-group-checkbox ag-invisible' },
        { tag: 'span', ref: 'eValue', cls: 'ag-group-value' },
        { tag: 'span', ref: 'eChildCount', cls: 'ag-group-child-count' },
    ],
};

export class GroupCellRenderer extends Component implements ICellRendererComp {
    private readonly eExpanded: HTMLElement = RefPlaceholder;
    private readonly eContracted: HTMLElement = RefPlaceholder;
    private readonly eCheckbox: HTMLElement = RefPlaceholder;
    private readonly eValue: HTMLElement = RefPlaceholder;
    private readonly eChildCount: HTMLElement = RefPlaceholder;

    // this cell renderer
    private innerCellRenderer: ICellRendererComp;

    constructor() {
        super(GroupCellRendererElement);
    }

    public init(params: GroupCellRendererParams): void {
        const compProxy: IGroupCellRenderer = {
            setInnerRenderer: (compDetails, valueToDisplay) => this.setRenderDetails(compDetails, valueToDisplay),
            setChildCount: (count) => (this.eChildCount.textContent = count),
            toggleCss: (cssClass, value) => this.toggleCss(cssClass, value),
            setContractedDisplayed: (expanded) => _setDisplayed(this.eContracted, expanded),
            setExpandedDisplayed: (expanded) => _setDisplayed(this.eExpanded, expanded),
            setCheckboxVisible: (visible) => this.eCheckbox.classList.toggle('ag-invisible', !visible),
            setCheckboxSpacing: (add) => this.eCheckbox.classList.toggle('ag-group-checkbox-spacing', add),
        };

        const ctrl = this.createManagedBean(new GroupCellRendererCtrl());
        const fullWidth = !params.colDef;
        const eGui = this.getGui();
        ctrl.init(compProxy, eGui, this.eCheckbox, this.eExpanded, this.eContracted, this.constructor, params);

        if (fullWidth) {
            _setAriaRole(eGui, ctrl.getCellAriaRole());
        }
    }

    private setRenderDetails(compDetails: UserCompDetails | undefined, valueToDisplay: any): void {
        if (compDetails) {
            compDetails.newAgStackInstance().then((comp) => {
                if (!comp) {
                    return;
                }
                const destroyComp = () => this.destroyBean(comp);
                if (this.isAlive()) {
                    this.eValue.appendChild(comp.getGui());
                    this.addDestroyFunc(destroyComp);
                } else {
                    destroyComp();
                }
            });
        } else {
            // eslint-disable-next-line no-restricted-properties -- Could swap to textContent, but could be a breaking change
            this.eValue.innerText = valueToDisplay;
        }
    }

    public override destroy(): void {
        this.destroyBean(this.innerCellRenderer);
        super.destroy();
    }

    public refresh(): boolean {
        return false;
    }
}
