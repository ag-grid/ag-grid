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
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var touchListener_1 = require("../../widgets/touchListener");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var originalColumnGroup_1 = require("../../entities/originalColumnGroup");
var string_1 = require("../../utils/string");
var event_1 = require("../../utils/event");
var dom_1 = require("../../utils/dom");
var icon_1 = require("../../utils/icon");
var generic_1 = require("../../utils/generic");
var function_1 = require("../../utils/function");
var HeaderGroupComp = /** @class */ (function (_super) {
    __extends(HeaderGroupComp, _super);
    function HeaderGroupComp() {
        return _super.call(this, HeaderGroupComp.TEMPLATE) || this;
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    HeaderGroupComp.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    HeaderGroupComp.prototype.init = function (params) {
        this.params = params;
        this.checkWarnings();
        this.setupLabel();
        this.addGroupExpandIcon();
        this.setupExpandIcons();
    };
    HeaderGroupComp.prototype.checkWarnings = function () {
        var paramsAny = this.params;
        if (paramsAny.template) {
            var message_1 = "A template was provided for Header Group Comp - templates are only supported for Header Comps (not groups)";
            function_1.doOnce(function () { return console.warn(message_1); }, 'HeaderGroupComp.templateNotSupported');
        }
    };
    HeaderGroupComp.prototype.setupExpandIcons = function () {
        var _this = this;
        this.addInIcon("columnGroupOpened", "agOpened");
        this.addInIcon("columnGroupClosed", "agClosed");
        var expandAction = function (event) {
            if (event_1.isStopPropagationForAgGrid(event)) {
                return;
            }
            var newExpandedValue = !_this.params.columnGroup.isExpanded();
            _this.columnController.setColumnGroupOpened(_this.params.columnGroup.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };
        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);
        var stopPropagationAction = function (event) {
            event_1.stopPropagationForAgGrid(event);
        };
        // adding stopPropagation to the double click for the icons prevents double click action happening
        // when the icons are clicked. if the icons are double clicked, then the groups should open and
        // then close again straight away. if we also listened to double click, then the group would open,
        // close, then open, which is not what we want. double click should only action if the user double
        // clicks outside of the icons.
        this.addManagedListener(this.eCloseIcon, "dblclick", stopPropagationAction);
        this.addManagedListener(this.eOpenIcon, "dblclick", stopPropagationAction);
        this.addManagedListener(this.getGui(), "dblclick", expandAction);
        this.updateIconVisibility();
        var originalColumnGroup = this.params.columnGroup.getOriginalColumnGroup();
        this.addManagedListener(originalColumnGroup, originalColumnGroup_1.OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addManagedListener(originalColumnGroup, originalColumnGroup_1.OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    };
    HeaderGroupComp.prototype.addTouchAndClickListeners = function (eElement, action) {
        var touchListener = new touchListener_1.TouchListener(eElement, true);
        this.addManagedListener(touchListener, touchListener_1.TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
        this.addManagedListener(eElement, "click", action);
    };
    HeaderGroupComp.prototype.updateIconVisibility = function () {
        var columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            var expanded = this.params.columnGroup.isExpanded();
            dom_1.setDisplayed(this.eOpenIcon, expanded);
            dom_1.setDisplayed(this.eCloseIcon, !expanded);
        }
        else {
            dom_1.setDisplayed(this.eOpenIcon, false);
            dom_1.setDisplayed(this.eCloseIcon, false);
        }
    };
    HeaderGroupComp.prototype.addInIcon = function (iconName, refName) {
        var eIcon = icon_1.createIconNoSpan(iconName, this.gridOptionsWrapper, null);
        if (eIcon) {
            this.getRefElement(refName).appendChild(eIcon);
        }
    };
    HeaderGroupComp.prototype.addGroupExpandIcon = function () {
        if (!this.params.columnGroup.isExpandable()) {
            dom_1.setDisplayed(this.eOpenIcon, false);
            dom_1.setDisplayed(this.eCloseIcon, false);
            return;
        }
    };
    HeaderGroupComp.prototype.setupLabel = function () {
        // no renderer, default text render
        var displayName = this.params.displayName;
        if (generic_1.exists(displayName)) {
            var displayNameSanitised = string_1.escapeString(displayName);
            this.getRefElement('agLabel').innerHTML = displayNameSanitised;
        }
    };
    HeaderGroupComp.TEMPLATE = "<div class=\"ag-header-group-cell-label\" ref=\"agContainer\" role=\"presentation\">\n            <span ref=\"agLabel\" class=\"ag-header-group-text\" role=\"presentation\"></span>\n            <span ref=\"agOpened\" class=\"ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded\"></span>\n            <span ref=\"agClosed\" class=\"ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed\"></span>\n        </div>";
    __decorate([
        context_1.Autowired("columnController")
    ], HeaderGroupComp.prototype, "columnController", void 0);
    __decorate([
        componentAnnotations_1.RefSelector("agOpened")
    ], HeaderGroupComp.prototype, "eOpenIcon", void 0);
    __decorate([
        componentAnnotations_1.RefSelector("agClosed")
    ], HeaderGroupComp.prototype, "eCloseIcon", void 0);
    return HeaderGroupComp;
}(component_1.Component));
exports.HeaderGroupComp = HeaderGroupComp;

//# sourceMappingURL=headerGroupComp.js.map
