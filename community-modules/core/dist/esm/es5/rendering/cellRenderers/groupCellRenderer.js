/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var GroupCellRenderer = /** @class */ (function (_super) {
    __extends(GroupCellRenderer, _super);
    function GroupCellRenderer() {
        return _super.call(this, GroupCellRenderer.TEMPLATE) || this;
    }
    GroupCellRenderer.prototype.init = function (params) {
        var _this = this;
        var compProxy = {
            setInnerRenderer: function (compDetails, valueToDisplay) { return _this.setRenderDetails(compDetails, valueToDisplay); },
            setChildCount: function (count) { return _this.eChildCount.innerHTML = count; },
            addOrRemoveCssClass: function (cssClass, value) { return _this.addOrRemoveCssClass(cssClass, value); },
            setContractedDisplayed: function (expanded) { return setDisplayed(_this.eContracted, expanded); },
            setExpandedDisplayed: function (expanded) { return setDisplayed(_this.eExpanded, expanded); },
            setCheckboxVisible: function (visible) { return _this.eCheckbox.classList.toggle('ag-invisible', !visible); }
        };
        var ctrl = this.createManagedBean(new GroupCellRendererCtrl());
        var fullWidth = !params.colDef;
        var eGui = this.getGui();
        ctrl.init(compProxy, eGui, this.eCheckbox, this.eExpanded, this.eContracted, this.constructor, params);
        if (fullWidth) {
            setAriaRole(eGui, 'gridcell');
        }
    };
    GroupCellRenderer.prototype.setRenderDetails = function (compDetails, valueToDisplay) {
        var _this = this;
        if (compDetails) {
            var componentPromise = compDetails.newAgStackInstance();
            if (!componentPromise) {
                return;
            }
            componentPromise.then(function (comp) {
                if (!comp) {
                    return;
                }
                var destroyComp = function () { return _this.context.destroyBean(comp); };
                if (_this.isAlive()) {
                    _this.eValue.appendChild(comp.getGui());
                    _this.addDestroyFunc(destroyComp);
                }
                else {
                    destroyComp();
                }
            });
        }
        else {
            this.eValue.innerText = valueToDisplay;
        }
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to have public here instead of private or protected
    GroupCellRenderer.prototype.destroy = function () {
        this.getContext().destroyBean(this.innerCellRenderer);
        _super.prototype.destroy.call(this);
    };
    GroupCellRenderer.prototype.refresh = function () {
        return false;
    };
    GroupCellRenderer.TEMPLATE = "<span class=\"ag-cell-wrapper\">\n            <span class=\"ag-group-expanded\" ref=\"eExpanded\"></span>\n            <span class=\"ag-group-contracted\" ref=\"eContracted\"></span>\n            <span class=\"ag-group-checkbox ag-invisible\" ref=\"eCheckbox\"></span>\n            <span class=\"ag-group-value\" ref=\"eValue\"></span>\n            <span class=\"ag-group-child-count\" ref=\"eChildCount\"></span>\n        </span>";
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
    return GroupCellRenderer;
}(Component));
export { GroupCellRenderer };
