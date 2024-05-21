import { UserCompDetails } from '../../components/framework/userComponentFactory';
import { _setAriaRole } from '../../utils/aria';
import { _setDisplayed } from '../../utils/dom';
import { Component } from '../../widgets/component';
import { GroupCellRendererCtrl, GroupCellRendererParams, IGroupCellRenderer } from './groupCellRendererCtrl';
import { ICellRendererComp } from './iCellRenderer';

export class GroupCellRenderer extends Component implements ICellRendererComp {
    private static TEMPLATE /* html */ = `<span class="ag-cell-wrapper">
            <span class="ag-group-expanded" data-ref="eExpanded"></span>
            <span class="ag-group-contracted" data-ref="eContracted"></span>
            <span class="ag-group-checkbox ag-invisible" data-ref="eCheckbox"></span>
            <span class="ag-group-value" data-ref="eValue"></span>
            <span class="ag-group-child-count" data-ref="eChildCount"></span>
        </span>`;

    private readonly eExpanded: HTMLElement;
    private readonly eContracted: HTMLElement;
    private readonly eCheckbox: HTMLElement;
    private readonly eValue: HTMLElement;
    private readonly eChildCount: HTMLElement;

    // this cell renderer
    private innerCellRenderer: ICellRendererComp;

    constructor() {
        super(GroupCellRenderer.TEMPLATE);
    }

    public init(params: GroupCellRendererParams): void {
        const compProxy: IGroupCellRenderer = {
            setInnerRenderer: (compDetails, valueToDisplay) => this.setRenderDetails(compDetails, valueToDisplay),
            setChildCount: (count) => (this.eChildCount.textContent = count),
            addOrRemoveCssClass: (cssClass, value) => this.addOrRemoveCssClass(cssClass, value),
            setContractedDisplayed: (expanded) => _setDisplayed(this.eContracted, expanded),
            setExpandedDisplayed: (expanded) => _setDisplayed(this.eExpanded, expanded),
            setCheckboxVisible: (visible) => this.eCheckbox.classList.toggle('ag-invisible', !visible),
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
            const componentPromise = compDetails.newAgStackInstance();
            if (!componentPromise) {
                return;
            }
            componentPromise.then((comp) => {
                if (!comp) {
                    return;
                }
                const destroyComp = () => this.context.destroyBean(comp);
                if (this.isAlive()) {
                    this.eValue.appendChild(comp.getGui());
                    this.addDestroyFunc(destroyComp);
                } else {
                    destroyComp();
                }
            });
        } else {
            this.eValue.innerText = valueToDisplay;
        }
    }

    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to have public here instead of private or protected
    public destroy(): void {
        this.getContext().destroyBean(this.innerCellRenderer);
        super.destroy();
    }

    public refresh(): boolean {
        return false;
    }
}
