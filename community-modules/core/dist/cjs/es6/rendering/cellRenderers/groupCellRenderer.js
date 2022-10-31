/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const aria_1 = require("../../utils/aria");
const dom_1 = require("../../utils/dom");
const component_1 = require("../../widgets/component");
const componentAnnotations_1 = require("../../widgets/componentAnnotations");
const groupCellRendererCtrl_1 = require("./groupCellRendererCtrl");
class GroupCellRenderer extends component_1.Component {
    constructor() {
        super(GroupCellRenderer.TEMPLATE);
    }
    init(params) {
        const compProxy = {
            setInnerRenderer: (compDetails, valueToDisplay) => this.setRenderDetails(compDetails, valueToDisplay),
            setChildCount: count => this.eChildCount.innerHTML = count,
            addOrRemoveCssClass: (cssClass, value) => this.addOrRemoveCssClass(cssClass, value),
            setContractedDisplayed: expanded => dom_1.setDisplayed(this.eContracted, expanded),
            setExpandedDisplayed: expanded => dom_1.setDisplayed(this.eExpanded, expanded),
            setCheckboxVisible: visible => this.eCheckbox.classList.toggle('ag-invisible', !visible)
        };
        const ctrl = this.createManagedBean(new groupCellRendererCtrl_1.GroupCellRendererCtrl());
        const fullWidth = !params.colDef;
        const eGui = this.getGui();
        ctrl.init(compProxy, eGui, this.eCheckbox, this.eExpanded, this.eContracted, this.constructor, params);
        if (fullWidth) {
            aria_1.setAriaRole(eGui, 'gridcell');
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
    componentAnnotations_1.RefSelector('eExpanded')
], GroupCellRenderer.prototype, "eExpanded", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eContracted')
], GroupCellRenderer.prototype, "eContracted", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eCheckbox')
], GroupCellRenderer.prototype, "eCheckbox", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eValue')
], GroupCellRenderer.prototype, "eValue", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eChildCount')
], GroupCellRenderer.prototype, "eChildCount", void 0);
exports.GroupCellRenderer = GroupCellRenderer;
