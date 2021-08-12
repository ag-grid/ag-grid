/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v26.0.0
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
import { Autowired, Optional, PostConstruct } from '../context/context';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { setAriaColCount, setAriaMultiSelectable, setAriaRowCount } from '../utils/aria';
import { addOrRemoveCssClass } from '../utils/dom';
import { LayoutCssClasses } from "../styling/layoutFeature";
import { CSS_CLASS_CELL_SELECTABLE, CSS_CLASS_COLUMN_MOVING, CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl, RowAnimationCssClasses } from "./gridBodyCtrl";
import { RowContainerName } from "./rowContainer/rowContainerCtrl";
var GRID_BODY_TEMPLATE = /* html */ "<div class=\"ag-root ag-unselectable\" role=\"grid\" unselectable=\"on\">\n        <ag-header-root ref=\"headerRoot\" unselectable=\"on\"></ag-header-root>\n        <div class=\"ag-floating-top\" ref=\"eTop\" role=\"presentation\" unselectable=\"on\">\n            <ag-row-container ref=\"topLeftContainer\" name=\"" + RowContainerName.TOP_LEFT + "\"></ag-row-container>\n            <ag-row-container ref=\"topCenterContainer\" name=\"" + RowContainerName.TOP_CENTER + "\"></ag-row-container>\n            <ag-row-container ref=\"topRightContainer\" name=\"" + RowContainerName.TOP_RIGHT + "\"></ag-row-container>\n            <ag-row-container ref=\"topFullWidthContainer\" name=\"" + RowContainerName.TOP_FULL_WITH + "\"></ag-row-container>\n        </div>\n        <div class=\"ag-body-viewport\" ref=\"eBodyViewport\" role=\"presentation\">\n            <ag-row-container ref=\"leftContainer\" name=\"" + RowContainerName.LEFT + "\"></ag-row-container>\n            <ag-row-container ref=\"centerContainer\" name=\"" + RowContainerName.CENTER + "\"></ag-row-container>\n            <ag-row-container ref=\"rightContainer\" name=\"" + RowContainerName.RIGHT + "\"></ag-row-container>\n            <ag-row-container ref=\"fullWidthContainer\" name=\"" + RowContainerName.FULL_WIDTH + "\"></ag-row-container>\n        </div>\n        <div class=\"ag-floating-bottom\" ref=\"eBottom\" role=\"presentation\" unselectable=\"on\">\n            <ag-row-container ref=\"bottomLeftContainer\" name=\"" + RowContainerName.BOTTOM_LEFT + "\"></ag-row-container>\n            <ag-row-container ref=\"bottomCenterContainer\" name=\"" + RowContainerName.BOTTOM_CENTER + "\"></ag-row-container>\n            <ag-row-container ref=\"bottomRightContainer\" name=\"" + RowContainerName.BOTTOM_RIGHT + "\"></ag-row-container>\n            <ag-row-container ref=\"bottomFullWidthContainer\" name=\"" + RowContainerName.BOTTOM_FULL_WITH + "\"></ag-row-container>\n        </div>\n        <ag-fake-horizontal-scroll></ag-fake-horizontal-scroll>\n        <ag-overlay-wrapper></ag-overlay-wrapper>\n    </div>";
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
            setColumnCount: function (count) { return setAriaColCount(_this.getGui(), count); },
            setRowCount: function (count) { return setAriaRowCount(_this.getGui(), count); },
            setTopHeight: function (height) { return setHeight(height, _this.eTop); },
            setBottomHeight: function (height) { return setHeight(height, _this.eBottom); },
            setTopDisplay: function (display) { return _this.eTop.style.display = display; },
            setBottomDisplay: function (display) { return _this.eBottom.style.display = display; },
            setColumnMovingCss: function (cssClass, flag) { return _this.addOrRemoveCssClass(CSS_CLASS_COLUMN_MOVING, flag); },
            updateLayoutClasses: function (cssClass, params) {
                addOrRemoveCssClass(_this.eBodyViewport, LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                addOrRemoveCssClass(_this.eBodyViewport, LayoutCssClasses.NORMAL, params.normal);
                addOrRemoveCssClass(_this.eBodyViewport, LayoutCssClasses.PRINT, params.print);
                _this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                _this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
                _this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: function (cssClass, on) {
                return addOrRemoveCssClass(_this.eBodyViewport, CSS_CLASS_FORCE_VERTICAL_SCROLL, on);
            },
            registerBodyViewportResizeListener: function (listener) {
                var unsubscribeFromResize = _this.resizeObserverService.observeResize(_this.eBodyViewport, listener);
                _this.addDestroyFunc(function () { return unsubscribeFromResize(); });
            },
            setPinnedTopBottomOverflowY: function (overflow) { return _this.eTop.style.overflowY = _this.eBottom.style.overflowY = overflow; },
            setCellSelectableCss: function (cssClass, selectable) {
                [_this.eTop, _this.eBodyViewport, _this.eBottom]
                    .forEach(function (ct) { return addOrRemoveCssClass(ct, CSS_CLASS_CELL_SELECTABLE, selectable); });
            },
        };
        this.ctrl = this.createManagedBean(new GridBodyCtrl());
        this.ctrl.setComp(compProxy, this.getGui(), this.eBodyViewport, this.eTop, this.eBottom);
        if (this.rangeService || this.gridOptionsWrapper.isRowSelectionMulti()) {
            setAriaMultiSelectable(this.getGui(), true);
        }
    };
    GridBodyComp.prototype.setRowAnimationCssOnBodyViewport = function (cssClass, animateRows) {
        addOrRemoveCssClass(this.eBodyViewport, RowAnimationCssClasses.ANIMATION_ON, animateRows);
        addOrRemoveCssClass(this.eBodyViewport, RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    };
    GridBodyComp.prototype.getFloatingTopBottom = function () {
        return [this.eTop, this.eBottom];
    };
    __decorate([
        Autowired('resizeObserverService')
    ], GridBodyComp.prototype, "resizeObserverService", void 0);
    __decorate([
        Optional('rangeService')
    ], GridBodyComp.prototype, "rangeService", void 0);
    __decorate([
        RefSelector('eBodyViewport')
    ], GridBodyComp.prototype, "eBodyViewport", void 0);
    __decorate([
        RefSelector('eTop')
    ], GridBodyComp.prototype, "eTop", void 0);
    __decorate([
        RefSelector('eBottom')
    ], GridBodyComp.prototype, "eBottom", void 0);
    __decorate([
        RefSelector('headerRoot')
    ], GridBodyComp.prototype, "headerRootComp", void 0);
    __decorate([
        PostConstruct
    ], GridBodyComp.prototype, "init", null);
    return GridBodyComp;
}(Component));
export { GridBodyComp };
