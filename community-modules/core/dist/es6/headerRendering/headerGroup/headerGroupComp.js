/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
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
import { Component } from "../../widgets/component";
import { Autowired } from "../../context/context";
import { TouchListener } from "../../widgets/touchListener";
import { RefSelector } from "../../widgets/componentAnnotations";
import { OriginalColumnGroup } from "../../entities/originalColumnGroup";
import { _ } from "../../utils";
var HeaderGroupComp = /** @class */ (function (_super) {
    __extends(HeaderGroupComp, _super);
    function HeaderGroupComp() {
        return _super.call(this, HeaderGroupComp.TEMPLATE) || this;
    }
    HeaderGroupComp.prototype.init = function (params) {
        this.params = params;
        this.setupLabel();
        this.addGroupExpandIcon();
        this.setupExpandIcons();
    };
    HeaderGroupComp.prototype.setupExpandIcons = function () {
        var _this = this;
        this.addInIcon("columnGroupOpened", "agOpened");
        this.addInIcon("columnGroupClosed", "agClosed");
        var expandAction = function (event) {
            if (_.isStopPropagationForAgGrid(event)) {
                return;
            }
            var newExpandedValue = !_this.params.columnGroup.isExpanded();
            _this.columnController.setColumnGroupOpened(_this.params.columnGroup.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };
        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);
        var stopPropagationAction = function (event) {
            _.stopPropagationForAgGrid(event);
        };
        // adding stopPropagation to the double click for the icons prevents double click action happening
        // when the icons are clicked. if the icons are double clicked, then the groups should open and
        // then close again straight away. if we also listened to double click, then the group would open,
        // close, then open, which is not what we want. double click should only action if the user double
        // clicks outside of the icons.
        this.addDestroyableEventListener(this.eCloseIcon, "dblclick", stopPropagationAction);
        this.addDestroyableEventListener(this.eOpenIcon, "dblclick", stopPropagationAction);
        this.addDestroyableEventListener(this.getGui(), "dblclick", expandAction);
        this.updateIconVisibility();
        var originalColumnGroup = this.params.columnGroup.getOriginalColumnGroup();
        this.addDestroyableEventListener(originalColumnGroup, OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addDestroyableEventListener(originalColumnGroup, OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    };
    HeaderGroupComp.prototype.addTouchAndClickListeners = function (eElement, action) {
        var touchListener = new TouchListener(eElement);
        this.addDestroyableEventListener(touchListener, TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
        this.addDestroyableEventListener(eElement, "click", action);
    };
    HeaderGroupComp.prototype.updateIconVisibility = function () {
        var columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            var expanded = this.params.columnGroup.isExpanded();
            _.setDisplayed(this.eOpenIcon, expanded);
            _.setDisplayed(this.eCloseIcon, !expanded);
        }
        else {
            _.setDisplayed(this.eOpenIcon, false);
            _.setDisplayed(this.eCloseIcon, false);
        }
    };
    HeaderGroupComp.prototype.addInIcon = function (iconName, refName) {
        var eIcon = _.createIconNoSpan(iconName, this.gridOptionsWrapper, null);
        this.getRefElement(refName).appendChild(eIcon);
    };
    HeaderGroupComp.prototype.addGroupExpandIcon = function () {
        if (!this.params.columnGroup.isExpandable()) {
            _.setDisplayed(this.eOpenIcon, false);
            _.setDisplayed(this.eCloseIcon, false);
            return;
        }
    };
    HeaderGroupComp.prototype.setupLabel = function () {
        // no renderer, default text render
        if (this.params.displayName && this.params.displayName !== "") {
            var eInnerText = this.getRefElement("agLabel");
            eInnerText.innerHTML = this.params.displayName;
        }
    };
    HeaderGroupComp.TEMPLATE = "<div class=\"ag-header-group-cell-label\" ref=\"agContainer\" role=\"presentation\">" +
        "<span ref=\"agLabel\" class=\"ag-header-group-text\" role=\"columnheader\"></span>" +
        "<span ref=\"agOpened\" class=\"ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded\"></span>" +
        "<span ref=\"agClosed\" class=\"ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed\"></span>" +
        "</div>";
    __decorate([
        Autowired("columnController")
    ], HeaderGroupComp.prototype, "columnController", void 0);
    __decorate([
        Autowired("gridOptionsWrapper")
    ], HeaderGroupComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        RefSelector("agOpened")
    ], HeaderGroupComp.prototype, "eOpenIcon", void 0);
    __decorate([
        RefSelector("agClosed")
    ], HeaderGroupComp.prototype, "eCloseIcon", void 0);
    return HeaderGroupComp;
}(Component));
export { HeaderGroupComp };
