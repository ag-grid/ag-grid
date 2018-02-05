/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v16.0.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var utils_1 = require("../../utils");
var columnController_1 = require("../../columnController/columnController");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var context_1 = require("../../context/context");
var touchListener_1 = require("../../widgets/touchListener");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var originalColumnGroup_1 = require("../../entities/originalColumnGroup");
var HeaderGroupComp = (function (_super) {
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
        this.addInIcon('columnGroupOpened', 'agOpened');
        this.addInIcon('columnGroupClosed', 'agClosed');
        var expandAction = function () {
            var newExpandedValue = !_this.params.columnGroup.isExpanded();
            _this.columnController.setColumnGroupOpened(_this.params.columnGroup.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        };
        this.addTouchAndClickListeners(this.eCloseIcon, expandAction);
        this.addTouchAndClickListeners(this.eOpenIcon, expandAction);
        this.addDestroyableEventListener(this.getGui(), 'dblclick', expandAction);
        this.updateIconVisibility();
        var originalColumnGroup = this.params.columnGroup.getOriginalColumnGroup();
        this.addDestroyableEventListener(originalColumnGroup, originalColumnGroup_1.OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.updateIconVisibility.bind(this));
        this.addDestroyableEventListener(originalColumnGroup, originalColumnGroup_1.OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED, this.updateIconVisibility.bind(this));
    };
    HeaderGroupComp.prototype.addTouchAndClickListeners = function (eElement, action) {
        var touchListener = new touchListener_1.TouchListener(this.eCloseIcon);
        this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_TAP, action);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
        this.addDestroyableEventListener(eElement, 'click', action);
    };
    HeaderGroupComp.prototype.updateIconVisibility = function () {
        var columnGroup = this.params.columnGroup;
        if (columnGroup.isExpandable()) {
            var expanded = this.params.columnGroup.isExpanded();
            utils_1.Utils.setVisible(this.eOpenIcon, !expanded);
            utils_1.Utils.setVisible(this.eCloseIcon, expanded);
        }
        else {
            utils_1.Utils.setVisible(this.eOpenIcon, false);
            utils_1.Utils.setVisible(this.eCloseIcon, false);
        }
    };
    HeaderGroupComp.prototype.addInIcon = function (iconName, refName) {
        var eIcon = utils_1.Utils.createIconNoSpan(iconName, this.gridOptionsWrapper, null);
        this.getRefElement(refName).appendChild(eIcon);
    };
    HeaderGroupComp.prototype.addGroupExpandIcon = function () {
        if (!this.params.columnGroup.isExpandable()) {
            utils_1.Utils.setVisible(this.eOpenIcon, false);
            utils_1.Utils.setVisible(this.eCloseIcon, false);
            return;
        }
    };
    HeaderGroupComp.prototype.setupLabel = function () {
        // no renderer, default text render
        if (this.params.displayName && this.params.displayName !== '') {
            if (utils_1.Utils.isBrowserSafari()) {
                this.getGui().style.display = 'table-cell';
            }
            var eInnerText = this.getRefElement('agLabel');
            eInnerText.innerHTML = this.params.displayName;
        }
    };
    HeaderGroupComp.TEMPLATE = "<div class=\"ag-header-group-cell-label\" ref=\"agContainer\">" +
        "<span ref=\"agLabel\" class=\"ag-header-group-text\"></span>" +
        "<span ref=\"agOpened\" class=\"ag-header-icon ag-header-expand-icon ag-header-expand-icon-expanded\"></span>" +
        "<span ref=\"agClosed\" class=\"ag-header-icon ag-header-expand-icon ag-header-expand-icon-collapsed\"></span>" +
        "</div>";
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], HeaderGroupComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderGroupComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('agOpened'),
        __metadata("design:type", HTMLElement)
    ], HeaderGroupComp.prototype, "eOpenIcon", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('agClosed'),
        __metadata("design:type", HTMLElement)
    ], HeaderGroupComp.prototype, "eCloseIcon", void 0);
    return HeaderGroupComp;
}(component_1.Component));
exports.HeaderGroupComp = HeaderGroupComp;
