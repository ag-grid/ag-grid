/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.3.5
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridBodyComp = void 0;
var context_1 = require("../context/context");
var layoutFeature_1 = require("../styling/layoutFeature");
var aria_1 = require("../utils/aria");
var component_1 = require("../widgets/component");
var componentAnnotations_1 = require("../widgets/componentAnnotations");
var gridBodyCtrl_1 = require("./gridBodyCtrl");
var rowContainerCtrl_1 = require("./rowContainer/rowContainerCtrl");
var GRID_BODY_TEMPLATE = /* html */ "<div class=\"ag-root ag-unselectable\" role=\"treegrid\">\n        <ag-header-root ref=\"gridHeader\"></ag-header-root>\n        <div class=\"ag-floating-top\" ref=\"eTop\" role=\"presentation\">\n            <ag-row-container ref=\"topLeftContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.TOP_LEFT + "\"></ag-row-container>\n            <ag-row-container ref=\"topCenterContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.TOP_CENTER + "\"></ag-row-container>\n            <ag-row-container ref=\"topRightContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.TOP_RIGHT + "\"></ag-row-container>\n            <ag-row-container ref=\"topFullWidthContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.TOP_FULL_WIDTH + "\"></ag-row-container>\n        </div>\n        <div class=\"ag-body\" ref=\"eBody\" role=\"presentation\">\n            <div class=\"ag-body-clipper\" ref=\"eBodyClipper\" role=\"presentation\">\n                <div class=\"ag-body-viewport\" ref=\"eBodyViewport\" role=\"presentation\">\n                    <ag-row-container ref=\"leftContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.LEFT + "\"></ag-row-container>\n                    <ag-row-container ref=\"centerContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.CENTER + "\"></ag-row-container>\n                    <ag-row-container ref=\"rightContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.RIGHT + "\"></ag-row-container>\n                    <ag-row-container ref=\"fullWidthContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.FULL_WIDTH + "\"></ag-row-container>\n                </div>\n            </div>\n            <ag-fake-vertical-scroll></ag-fake-vertical-scroll>\n        </div>\n        <div class=\"ag-sticky-top\" ref=\"eStickyTop\" role=\"presentation\">\n            <ag-row-container ref=\"stickyTopLeftContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.STICKY_TOP_LEFT + "\"></ag-row-container>\n            <ag-row-container ref=\"stickyTopCenterContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.STICKY_TOP_CENTER + "\"></ag-row-container>\n            <ag-row-container ref=\"stickyTopRightContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.STICKY_TOP_RIGHT + "\"></ag-row-container>\n            <ag-row-container ref=\"stickyTopFullWidthContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.STICKY_TOP_FULL_WIDTH + "\"></ag-row-container>\n        </div>\n        <div class=\"ag-floating-bottom\" ref=\"eBottom\" role=\"presentation\">\n            <ag-row-container ref=\"bottomLeftContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.BOTTOM_LEFT + "\"></ag-row-container>\n            <ag-row-container ref=\"bottomCenterContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.BOTTOM_CENTER + "\"></ag-row-container>\n            <ag-row-container ref=\"bottomRightContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.BOTTOM_RIGHT + "\"></ag-row-container>\n            <ag-row-container ref=\"bottomFullWidthContainer\" name=\"" + rowContainerCtrl_1.RowContainerName.BOTTOM_FULL_WIDTH + "\"></ag-row-container>\n        </div>\n        <ag-fake-horizontal-scroll></ag-fake-horizontal-scroll>\n        <ag-overlay-wrapper></ag-overlay-wrapper>\n    </div>";
var GridBodyComp = /** @class */ (function (_super) {
    __extends(GridBodyComp, _super);
    function GridBodyComp() {
        return _super.call(this, GRID_BODY_TEMPLATE) || this;
    }
    GridBodyComp.prototype.init = function () {
        var _this = this;
        var setHeight = function (height, element) {
            var heightString = height + "px";
            element.style.minHeight = heightString;
            element.style.height = heightString;
        };
        var compProxy = {
            setRowAnimationCssOnBodyViewport: function (cssClass, animate) { return _this.setRowAnimationCssOnBodyViewport(cssClass, animate); },
            setColumnCount: function (count) { return aria_1.setAriaColCount(_this.getGui(), count); },
            setRowCount: function (count) { return aria_1.setAriaRowCount(_this.getGui(), count); },
            setTopHeight: function (height) { return setHeight(height, _this.eTop); },
            setBottomHeight: function (height) { return setHeight(height, _this.eBottom); },
            setTopDisplay: function (display) { return _this.eTop.style.display = display; },
            setBottomDisplay: function (display) { return _this.eBottom.style.display = display; },
            setStickyTopHeight: function (height) { return _this.eStickyTop.style.height = height; },
            setStickyTopTop: function (top) { return _this.eStickyTop.style.top = top; },
            setStickyTopWidth: function (width) { return _this.eStickyTop.style.width = width; },
            setColumnMovingCss: function (cssClass, flag) { return _this.addOrRemoveCssClass(cssClass, flag); },
            updateLayoutClasses: function (cssClass, params) {
                var classLists = [
                    _this.eBodyViewport.classList,
                    _this.eBodyClipper.classList,
                    _this.eBody.classList
                ];
                classLists.forEach(function (classList) {
                    classList.toggle(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                    classList.toggle(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
                    classList.toggle(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
                });
                _this.addOrRemoveCssClass(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                _this.addOrRemoveCssClass(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
                _this.addOrRemoveCssClass(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: function (cssClass, on) {
                return _this.eBodyViewport.classList.toggle(gridBodyCtrl_1.CSS_CLASS_FORCE_VERTICAL_SCROLL, on);
            },
            registerBodyViewportResizeListener: function (listener) {
                var unsubscribeFromResize = _this.resizeObserverService.observeResize(_this.eBodyViewport, listener);
                _this.addDestroyFunc(function () { return unsubscribeFromResize(); });
            },
            setPinnedTopBottomOverflowY: function (overflow) { return _this.eTop.style.overflowY = _this.eBottom.style.overflowY = overflow; },
            setCellSelectableCss: function (cssClass, selectable) {
                [_this.eTop, _this.eBodyViewport, _this.eBottom]
                    .forEach(function (ct) { return ct.classList.toggle(gridBodyCtrl_1.CSS_CLASS_CELL_SELECTABLE, selectable); });
            },
            setBodyViewportWidth: function (width) { return _this.eBodyViewport.style.width = width; }
        };
        this.ctrl = this.createManagedBean(new gridBodyCtrl_1.GridBodyCtrl());
        this.ctrl.setComp(compProxy, this.getGui(), this.eBodyViewport, this.eTop, this.eBottom, this.eStickyTop);
        if (this.rangeService || this.gridOptionsService.get('rowSelection') === 'multiple') {
            aria_1.setAriaMultiSelectable(this.getGui(), true);
        }
    };
    GridBodyComp.prototype.setRowAnimationCssOnBodyViewport = function (cssClass, animateRows) {
        var bodyViewportClassList = this.eBodyViewport.classList;
        bodyViewportClassList.toggle(gridBodyCtrl_1.RowAnimationCssClasses.ANIMATION_ON, animateRows);
        bodyViewportClassList.toggle(gridBodyCtrl_1.RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    };
    GridBodyComp.prototype.getFloatingTopBottom = function () {
        return [this.eTop, this.eBottom];
    };
    __decorate([
        context_1.Autowired('resizeObserverService')
    ], GridBodyComp.prototype, "resizeObserverService", void 0);
    __decorate([
        context_1.Optional('rangeService')
    ], GridBodyComp.prototype, "rangeService", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBodyViewport')
    ], GridBodyComp.prototype, "eBodyViewport", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eStickyTop')
    ], GridBodyComp.prototype, "eStickyTop", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eTop')
    ], GridBodyComp.prototype, "eTop", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBottom')
    ], GridBodyComp.prototype, "eBottom", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('gridHeader')
    ], GridBodyComp.prototype, "headerRootComp", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBodyClipper')
    ], GridBodyComp.prototype, "eBodyClipper", void 0);
    __decorate([
        componentAnnotations_1.RefSelector('eBody')
    ], GridBodyComp.prototype, "eBody", void 0);
    __decorate([
        context_1.PostConstruct
    ], GridBodyComp.prototype, "init", null);
    return GridBodyComp;
}(component_1.Component));
exports.GridBodyComp = GridBodyComp;
