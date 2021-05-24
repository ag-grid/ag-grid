/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("./component");
var componentAnnotations_1 = require("./componentAnnotations");
var context_1 = require("../context/context");
var icon_1 = require("../utils/icon");
var dom_1 = require("../utils/dom");
var keyCode_1 = require("../constants/keyCode");
var AgGroupComponent = /** @class */ (function (_super) {
    __extends(AgGroupComponent, _super);
    function AgGroupComponent(params) {
        if (params === void 0) { params = {}; }
        var _this = _super.call(this, AgGroupComponent.getTemplate(params)) || this;
        _this.suppressEnabledCheckbox = true;
        _this.suppressOpenCloseIcons = false;
        var title = params.title, enabled = params.enabled, items = params.items, suppressEnabledCheckbox = params.suppressEnabledCheckbox, suppressOpenCloseIcons = params.suppressOpenCloseIcons;
        _this.title = title;
        _this.cssIdentifier = params.cssIdentifier || 'default';
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
    AgGroupComponent.getTemplate = function (params) {
        var cssIdentifier = params.cssIdentifier || 'default';
        var direction = params.direction || 'vertical';
        return /* html */ "<div class=\"ag-group ag-" + cssIdentifier + "-group\">\n            <div class=\"ag-group-title-bar ag-" + cssIdentifier + "-group-title-bar ag-unselectable\" ref=\"eTitleBar\">\n                <span class=\"ag-group-title-bar-icon ag-" + cssIdentifier + "-group-title-bar-icon\" ref=\"eGroupOpenedIcon\"></span>\n                <span class=\"ag-group-title-bar-icon ag-" + cssIdentifier + "-group-title-bar-icon\" ref=\"eGroupClosedIcon\"></span>\n                <span ref=\"eTitle\" class=\"ag-group-title ag-" + cssIdentifier + "-group-title\"></span>\n            </div>\n            <div ref=\"eToolbar\" class=\"ag-group-toolbar ag-" + cssIdentifier + "-group-toolbar\">\n                <ag-checkbox ref=\"cbGroupEnabled\"></ag-checkbox>\n            </div>\n            <div ref=\"eContainer\" class=\"ag-group-container ag-group-container-" + direction + " ag-" + cssIdentifier + "-group-container\"></div>\n        </div>";
    };
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
        this.refreshChildDisplay();
    };
    AgGroupComponent.prototype.setupExpandContract = function () {
        var _this = this;
        this.eGroupClosedIcon.appendChild(icon_1.createIcon('columnSelectClosed', this.gridOptionsWrapper, null));
        this.eGroupOpenedIcon.appendChild(icon_1.createIcon('columnSelectOpen', this.gridOptionsWrapper, null));
        this.addManagedListener(this.eTitleBar, 'click', function () { return _this.toggleGroupExpand(); });
        this.addManagedListener(this.eTitleBar, 'keydown', function (e) {
            switch (e.keyCode) {
                case keyCode_1.KeyCode.ENTER:
                    _this.toggleGroupExpand();
                    break;
                case keyCode_1.KeyCode.RIGHT:
                    _this.toggleGroupExpand(true);
                    break;
                case keyCode_1.KeyCode.LEFT:
                    _this.toggleGroupExpand(false);
                    break;
            }
        });
    };
    AgGroupComponent.prototype.refreshChildDisplay = function () {
        var showIcon = !this.suppressOpenCloseIcons;
        dom_1.setDisplayed(this.eToolbar, this.expanded && !this.suppressEnabledCheckbox);
        dom_1.setDisplayed(this.eGroupOpenedIcon, showIcon && this.expanded);
        dom_1.setDisplayed(this.eGroupClosedIcon, showIcon && !this.expanded);
    };
    AgGroupComponent.prototype.isExpanded = function () {
        return this.expanded;
    };
    AgGroupComponent.prototype.setAlignItems = function (alignment) {
        var eGui = this.getGui();
        if (this.alignItems !== alignment) {
            dom_1.removeCssClass(eGui, "ag-group-item-alignment-" + this.alignItems);
        }
        this.alignItems = alignment;
        var newCls = "ag-group-item-alignment-" + this.alignItems;
        dom_1.addCssClass(eGui, newCls);
        return this;
    };
    AgGroupComponent.prototype.toggleGroupExpand = function (expanded) {
        if (this.suppressOpenCloseIcons) {
            this.expanded = true;
            this.refreshChildDisplay();
            dom_1.setDisplayed(this.eContainer, true);
            return this;
        }
        expanded = expanded != null ? expanded : !this.expanded;
        if (this.expanded === expanded) {
            return this;
        }
        this.expanded = expanded;
        this.refreshChildDisplay();
        dom_1.setDisplayed(this.eContainer, expanded);
        this.dispatchEvent({ type: this.expanded ? AgGroupComponent.EVENT_EXPANDED : AgGroupComponent.EVENT_COLLAPSED });
        return this;
    };
    AgGroupComponent.prototype.addItems = function (items) {
        var _this = this;
        items.forEach(function (item) { return _this.addItem(item); });
    };
    AgGroupComponent.prototype.addItem = function (item) {
        var container = this.eContainer;
        var el = item instanceof component_1.Component ? item.getGui() : item;
        dom_1.addCssClass(el, 'ag-group-item');
        dom_1.addCssClass(el, "ag-" + this.cssIdentifier + "-group-item");
        container.appendChild(el);
        this.items.push(el);
    };
    AgGroupComponent.prototype.hideItem = function (hide, index) {
        var itemToHide = this.items[index];
        dom_1.addOrRemoveCssClass(itemToHide, 'ag-hidden', hide);
    };
    AgGroupComponent.prototype.setTitle = function (title) {
        this.eTitle.innerText = title;
        return this;
    };
    AgGroupComponent.prototype.addCssClassToTitleBar = function (cssClass) {
        dom_1.addCssClass(this.eTitleBar, cssClass);
    };
    AgGroupComponent.prototype.setEnabled = function (enabled, skipToggle) {
        this.enabled = enabled;
        this.refreshDisabledStyles();
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
        this.suppressEnabledCheckbox = hide;
        this.refreshChildDisplay();
        this.refreshDisabledStyles();
        return this;
    };
    AgGroupComponent.prototype.hideOpenCloseIcons = function (hide) {
        this.suppressOpenCloseIcons = hide;
        if (hide) {
            this.toggleGroupExpand(true);
        }
        return this;
    };
    AgGroupComponent.prototype.refreshDisabledStyles = function () {
        dom_1.addOrRemoveCssClass(this.getGui(), 'ag-disabled', !this.enabled);
        if (this.suppressEnabledCheckbox && !this.enabled) {
            dom_1.addCssClass(this.eTitleBar, 'ag-disabled-group-title-bar');
            this.eTitleBar.removeAttribute('tabindex');
        }
        else {
            dom_1.removeCssClass(this.eTitleBar, 'ag-disabled-group-title-bar');
            this.eTitleBar.setAttribute('tabindex', '0');
        }
        dom_1.addOrRemoveCssClass(this.eContainer, 'ag-disabled-group-container', !this.enabled);
    };
    AgGroupComponent.EVENT_EXPANDED = 'expanded';
    AgGroupComponent.EVENT_COLLAPSED = 'collapsed';
    __decorate([
        componentAnnotations_1.RefSelector('eTitleBar')
    ], AgGroupComponent.prototype, "eTitleBar", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eGroupOpenedIcon')
    ], AgGroupComponent.prototype, "eGroupOpenedIcon", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eGroupClosedIcon')
    ], AgGroupComponent.prototype, "eGroupClosedIcon", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eToolbar')
    ], AgGroupComponent.prototype, "eToolbar", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('cbGroupEnabled')
    ], AgGroupComponent.prototype, "cbGroupEnabled", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTitle')
    ], AgGroupComponent.prototype, "eTitle", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eContainer')
    ], AgGroupComponent.prototype, "eContainer", void 0);
    __decorate([
        context_1.PostConstruct
    ], AgGroupComponent.prototype, "postConstruct", null);
    return AgGroupComponent;
}(component_1.Component));
exports.AgGroupComponent = AgGroupComponent;

//# sourceMappingURL=agGroupComponent.js.map
