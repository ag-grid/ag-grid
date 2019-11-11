/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v22.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { Component } from "./component";
import { RefSelector } from "./componentAnnotations";
import { Autowired, PostConstruct } from "../context/context";
import { _ } from "../utils";
var AgGroupComponent = /** @class */ (function (_super) {
    __extends(AgGroupComponent, _super);
    function AgGroupComponent(params) {
        var _this = _super.call(this, AgGroupComponent.TEMPLATE) || this;
        _this.suppressEnabledCheckbox = true;
        _this.suppressOpenCloseIcons = false;
        if (!params) {
            params = {};
        }
        var title = params.title, enabled = params.enabled, items = params.items, suppressEnabledCheckbox = params.suppressEnabledCheckbox, suppressOpenCloseIcons = params.suppressOpenCloseIcons;
        _this.title = title;
        _this.enabled = enabled != null ? enabled : true;
        _this.items = items || [];
        _this.alignItems = params.alignItems || 'center';
        if (suppressEnabledCheckbox != null) {
            _this.suppressEnabledCheckbox = suppressEnabledCheckbox;
        }
        if (suppressOpenCloseIcons != null) {
            _this.suppressOpenCloseIcons = suppressOpenCloseIcons;
        }
        return _this;
    }
    AgGroupComponent.prototype.postConstruct = function () {
        if (this.items.length) {
            var initialItems = this.items;
            this.items = [];
            this.addItems(initialItems);
        }
        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
        this.cbGroupEnabled.setLabel(localeTextFunc('enabled', 'Enabled'));
        if (this.title) {
            this.setTitle(this.title);
        }
        if (this.enabled) {
            this.setEnabled(this.enabled);
        }
        this.setAlignItems(this.alignItems);
        this.hideEnabledCheckbox(this.suppressEnabledCheckbox);
        this.hideOpenCloseIcons(this.suppressOpenCloseIcons);
        this.setupExpandContract();
    };
    AgGroupComponent.prototype.setupExpandContract = function () {
        var _this = this;
        this.eGroupClosedIcon.appendChild(_.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(_.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.setOpenClosedIcons();
        this.addDestroyableEventListener(this.groupTitle, 'click', function () { return _this.toggleGroupExpand(); });
    };
    AgGroupComponent.prototype.setOpenClosedIcons = function () {
        var folderOpen = this.expanded;
        _.setDisplayed(this.eGroupClosedIcon, !folderOpen);
        _.setDisplayed(this.eGroupOpenedIcon, folderOpen);
    };
    AgGroupComponent.prototype.isExpanded = function () {
        return this.expanded;
    };
    AgGroupComponent.prototype.setAlignItems = function (alignment) {
        var eGui = this.getGui();
        if (this.alignItems !== alignment) {
            _.removeCssClass(eGui, "ag-alignment-" + this.alignItems);
        }
        this.alignItems = alignment;
        var newCls = "ag-alignment-" + this.alignItems;
        if (alignment !== 'center' && !_.containsClass(eGui, newCls)) {
            _.addCssClass(eGui, newCls);
        }
        return this;
    };
    AgGroupComponent.prototype.toggleGroupExpand = function (expanded) {
        var eGui = this.getGui();
        if (this.suppressOpenCloseIcons) {
            this.expanded = true;
            _.removeCssClass(eGui, 'ag-collapsed');
            return this;
        }
        expanded = expanded != null ? expanded : !this.expanded;
        if (this.expanded === expanded) {
            return this;
        }
        this.expanded = expanded;
        this.setOpenClosedIcons();
        _.addOrRemoveCssClass(eGui, 'ag-collapsed', !expanded);
        if (this.expanded) {
            var event_1 = {
                type: 'expanded',
            };
            this.dispatchEvent(event_1);
        }
        else {
            var event_2 = {
                type: 'collapsed',
            };
            this.dispatchEvent(event_2);
        }
        return this;
    };
    AgGroupComponent.prototype.addItems = function (items) {
        var _this = this;
        items.forEach(function (item) { return _this.addItem(item); });
    };
    AgGroupComponent.prototype.addItem = function (item) {
        var container = this.groupContainer;
        var el = item instanceof Component ? item.getGui() : item;
        _.addCssClass(el, 'ag-group-item');
        container.appendChild(el);
        this.items.push(el);
    };
    AgGroupComponent.prototype.hideItem = function (hide, index) {
        var itemToHide = this.items[index];
        _.addOrRemoveCssClass(itemToHide, 'ag-hidden', hide);
    };
    AgGroupComponent.prototype.setTitle = function (title) {
        this.lbGroupTitle.innerText = title;
        return this;
    };
    AgGroupComponent.prototype.setEnabled = function (enabled, skipToggle) {
        this.enabled = enabled;
        _.addOrRemoveCssClass(this.getGui(), 'ag-disabled', !enabled);
        this.toggleGroupExpand(enabled);
        if (!skipToggle) {
            this.cbGroupEnabled.setValue(enabled);
        }
        return this;
    };
    AgGroupComponent.prototype.isEnabled = function () {
        return this.enabled;
    };
    AgGroupComponent.prototype.onEnableChange = function (callbackFn) {
        var _this = this;
        this.cbGroupEnabled.onValueChange(function (newSelection) {
            _this.setEnabled(newSelection, true);
            callbackFn(newSelection);
        });
        return this;
    };
    AgGroupComponent.prototype.hideEnabledCheckbox = function (hide) {
        _.addOrRemoveCssClass(this.eToolbar, 'ag-hidden', hide);
        return this;
    };
    AgGroupComponent.prototype.hideOpenCloseIcons = function (hide) {
        this.suppressOpenCloseIcons = hide;
        _.addOrRemoveCssClass(this.getGui(), 'ag-collapsible', !hide);
        if (hide) {
            this.toggleGroupExpand(true);
        }
        return this;
    };
    AgGroupComponent.TEMPLATE = "<div class=\"ag-group-component\">\n            <div class=\"ag-group-component-title-bar\" ref=\"groupTitle\">\n                 <span class=\"ag-column-group-icons\">\n                    <span class=\"ag-column-group-opened-icon\" ref=\"eGroupOpenedIcon\"></span>\n                    <span class=\"ag-column-group-closed-icon\" ref=\"eGroupClosedIcon\"></span>\n                </span>\n                <span ref=\"lbGroupTitle\" class=\"ag-group-component-title\"></span>\n            </div>\n            <div ref=\"eToolbar\" class=\"ag-group-component-toolbar\">\n                <ag-checkbox ref=\"cbGroupEnabled\"></ag-checkbox>\n            </div>\n            <div ref=\"eContainer\" class=\"ag-group-component-container\"></div>\n        </div>";
    __decorate([
        Autowired('gridOptionsWrapper')
    ], AgGroupComponent.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        RefSelector('groupTitle')
    ], AgGroupComponent.prototype, "groupTitle", void 0);
    __decorate([
        RefSelector('eGroupOpenedIcon')
    ], AgGroupComponent.prototype, "eGroupOpenedIcon", void 0);
    __decorate([
        RefSelector('eGroupClosedIcon')
    ], AgGroupComponent.prototype, "eGroupClosedIcon", void 0);
    __decorate([
        RefSelector('eToolbar')
    ], AgGroupComponent.prototype, "eToolbar", void 0);
    __decorate([
        RefSelector('cbGroupEnabled')
    ], AgGroupComponent.prototype, "cbGroupEnabled", void 0);
    __decorate([
        RefSelector("lbGroupTitle")
    ], AgGroupComponent.prototype, "lbGroupTitle", void 0);
    __decorate([
        RefSelector("eContainer")
    ], AgGroupComponent.prototype, "groupContainer", void 0);
    __decorate([
        PostConstruct
    ], AgGroupComponent.prototype, "postConstruct", null);
    return AgGroupComponent;
}(Component));
export { AgGroupComponent };
