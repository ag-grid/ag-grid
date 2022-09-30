/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { setAriaRole } from "../../utils/aria";
import { setDisplayed } from "../../utils/dom";
import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { GroupCellRendererCtrl } from "./groupCellRendererCtrl";
export class GroupCellRenderer extends Component {
    constructor() {
        super(GroupCellRenderer.TEMPLATE);
    }
    init(params) {
        const compProxy = {
            setInnerRenderer: (compDetails, valueToDisplay) => this.setRenderDetails(compDetails, valueToDisplay),
            setChildCount: count => this.eChildCount.innerHTML = count,
            addOrRemoveCssClass: (cssClass, value) => this.addOrRemoveCssClass(cssClass, value),
            setContractedDisplayed: expanded => setDisplayed(this.eContracted, expanded),
            setExpandedDisplayed: expanded => setDisplayed(this.eExpanded, expanded),
            setCheckboxVisible: visible => this.eCheckbox.classList.toggle('ag-invisible', !visible)
        };
        const ctrl = this.createManagedBean(new GroupCellRendererCtrl());
        const fullWidth = !params.colDef;
        const eGui = this.getGui();
        ctrl.init(compProxy, eGui, this.eCheckbox, this.eExpanded, this.eContracted, this.constructor, params);
        if (fullWidth) {
            setAriaRole(eGui, 'gridcell');
        }
    }
    setRenderDetails(compDetails, valueToDisplay) {
        if (compDetails) {
            const componentPromise = compDetails.newAgStackInstance();
            if (!componentPromise) {
                return;
            }
            componentPromise.then(comp => {
                if (!comp) {
                    return;
                }
                const destroyComp = () => this.context.destroyBean(comp);
                if (this.isAlive()) {
                    this.eValue.appendChild(comp.getGui());
                    this.addDestroyFunc(destroyComp);
                }
                else {
                    destroyComp();
                }
            });
        }
        else {
            this.eValue.innerText = valueToDisplay;
        }
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to have public here instead of private or protected
    destroy() {
        this.getContext().destroyBean(this.innerCellRenderer);
        super.destroy();
    }
    refresh() {
        return false;
    }
}
GroupCellRenderer.TEMPLATE = `<span class="ag-cell-wrapper">
            <span class="ag-group-expanded" ref="eExpanded"></span>
            <span class="ag-group-contracted" ref="eContracted"></span>
            <span class="ag-group-checkbox ag-invisible" ref="eCheckbox"></span>
            <span class="ag-group-value" ref="eValue"></span>
            <span class="ag-group-child-count" ref="eChildCount"></span>
        </span>`;
__decorate([
    RefSelector('eExpanded')
], GroupCellRenderer.prototype, "eExpanded", void 0);
__decorate([
    RefSelector('eContracted')
], GroupCellRenderer.prototype, "eContracted", void 0);
__decorate([
    RefSelector('eCheckbox')
], GroupCellRenderer.prototype, "eCheckbox", void 0);
__decorate([
    RefSelector('eValue')
], GroupCellRenderer.prototype, "eValue", void 0);
__decorate([
    RefSelector('eChildCount')
], GroupCellRenderer.prototype, "eChildCount", void 0);
