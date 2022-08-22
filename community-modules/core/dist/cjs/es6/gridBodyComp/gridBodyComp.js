/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
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
const context_1 = require("../context/context");
const layoutFeature_1 = require("../styling/layoutFeature");
const aria_1 = require("../utils/aria");
const component_1 = require("../widgets/component");
const componentAnnotations_1 = require("../widgets/componentAnnotations");
const gridBodyCtrl_1 = require("./gridBodyCtrl");
const rowContainerCtrl_1 = require("./rowContainer/rowContainerCtrl");
const GRID_BODY_TEMPLATE = /* html */ `<div class="ag-root ag-unselectable" role="grid">
        <ag-header-root ref="gridHeader"></ag-header-root>
        <div class="ag-floating-top" ref="eTop" role="presentation">
            <ag-row-container ref="topLeftContainer" name="${rowContainerCtrl_1.RowContainerName.TOP_LEFT}"></ag-row-container>
            <ag-row-container ref="topCenterContainer" name="${rowContainerCtrl_1.RowContainerName.TOP_CENTER}"></ag-row-container>
            <ag-row-container ref="topRightContainer" name="${rowContainerCtrl_1.RowContainerName.TOP_RIGHT}"></ag-row-container>
            <ag-row-container ref="topFullWidthContainer" name="${rowContainerCtrl_1.RowContainerName.TOP_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-body-viewport" ref="eBodyViewport" role="presentation">
            <ag-row-container ref="leftContainer" name="${rowContainerCtrl_1.RowContainerName.LEFT}"></ag-row-container>
            <ag-row-container ref="centerContainer" name="${rowContainerCtrl_1.RowContainerName.CENTER}"></ag-row-container>
            <ag-row-container ref="rightContainer" name="${rowContainerCtrl_1.RowContainerName.RIGHT}"></ag-row-container>
            <ag-row-container ref="fullWidthContainer" name="${rowContainerCtrl_1.RowContainerName.FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-sticky-top" ref="eStickyTop" role="presentation">
            <ag-row-container ref="stickyTopLeftContainer" name="${rowContainerCtrl_1.RowContainerName.STICKY_TOP_LEFT}"></ag-row-container>
            <ag-row-container ref="stickyTopCenterContainer" name="${rowContainerCtrl_1.RowContainerName.STICKY_TOP_CENTER}"></ag-row-container>
            <ag-row-container ref="stickyTopRightContainer" name="${rowContainerCtrl_1.RowContainerName.STICKY_TOP_RIGHT}"></ag-row-container>
            <ag-row-container ref="stickyTopFullWidthContainer" name="${rowContainerCtrl_1.RowContainerName.STICKY_TOP_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-floating-bottom" ref="eBottom" role="presentation">
            <ag-row-container ref="bottomLeftContainer" name="${rowContainerCtrl_1.RowContainerName.BOTTOM_LEFT}"></ag-row-container>
            <ag-row-container ref="bottomCenterContainer" name="${rowContainerCtrl_1.RowContainerName.BOTTOM_CENTER}"></ag-row-container>
            <ag-row-container ref="bottomRightContainer" name="${rowContainerCtrl_1.RowContainerName.BOTTOM_RIGHT}"></ag-row-container>
            <ag-row-container ref="bottomFullWidthContainer" name="${rowContainerCtrl_1.RowContainerName.BOTTOM_FULL_WIDTH}"></ag-row-container>
        </div>
        <ag-fake-horizontal-scroll></ag-fake-horizontal-scroll>
        <ag-overlay-wrapper></ag-overlay-wrapper>
    </div>`;
class GridBodyComp extends component_1.Component {
    constructor() {
        super(GRID_BODY_TEMPLATE);
    }
    init() {
        const setHeight = (height, element) => {
            const heightString = `${height}px`;
            element.style.minHeight = heightString;
            element.style.height = heightString;
        };
        const compProxy = {
            setRowAnimationCssOnBodyViewport: (cssClass, animate) => this.setRowAnimationCssOnBodyViewport(cssClass, animate),
            setColumnCount: count => aria_1.setAriaColCount(this.getGui(), count),
            setRowCount: count => aria_1.setAriaRowCount(this.getGui(), count),
            setTopHeight: height => setHeight(height, this.eTop),
            setBottomHeight: height => setHeight(height, this.eBottom),
            setTopDisplay: display => this.eTop.style.display = display,
            setBottomDisplay: display => this.eBottom.style.display = display,
            setStickyTopHeight: height => this.eStickyTop.style.height = height,
            setStickyTopTop: top => this.eStickyTop.style.top = top,
            setStickyTopWidth: width => this.eStickyTop.style.width = width,
            setColumnMovingCss: (cssClass, flag) => this.addOrRemoveCssClass(gridBodyCtrl_1.CSS_CLASS_COLUMN_MOVING, flag),
            updateLayoutClasses: (cssClass, params) => {
                const bodyViewportClassList = this.eBodyViewport.classList;
                bodyViewportClassList.toggle(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                bodyViewportClassList.toggle(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
                bodyViewportClassList.toggle(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
                this.addOrRemoveCssClass(layoutFeature_1.LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                this.addOrRemoveCssClass(layoutFeature_1.LayoutCssClasses.NORMAL, params.normal);
                this.addOrRemoveCssClass(layoutFeature_1.LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: (cssClass, on) => this.eBodyViewport.classList.toggle(gridBodyCtrl_1.CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eBodyViewport, listener);
                this.addDestroyFunc(() => unsubscribeFromResize());
            },
            setPinnedTopBottomOverflowY: overflow => this.eTop.style.overflowY = this.eBottom.style.overflowY = overflow,
            setCellSelectableCss: (cssClass, selectable) => {
                [this.eTop, this.eBodyViewport, this.eBottom]
                    .forEach(ct => ct.classList.toggle(gridBodyCtrl_1.CSS_CLASS_CELL_SELECTABLE, selectable));
            },
        };
        this.ctrl = this.createManagedBean(new gridBodyCtrl_1.GridBodyCtrl());
        this.ctrl.setComp(compProxy, this.getGui(), this.eBodyViewport, this.eTop, this.eBottom, this.eStickyTop);
        if (this.rangeService || this.gridOptionsWrapper.isRowSelectionMulti()) {
            aria_1.setAriaMultiSelectable(this.getGui(), true);
        }
    }
    setRowAnimationCssOnBodyViewport(cssClass, animateRows) {
        const bodyViewportClassList = this.eBodyViewport.classList;
        bodyViewportClassList.toggle(gridBodyCtrl_1.RowAnimationCssClasses.ANIMATION_ON, animateRows);
        bodyViewportClassList.toggle(gridBodyCtrl_1.RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    }
    getFloatingTopBottom() {
        return [this.eTop, this.eBottom];
    }
}
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
    context_1.PostConstruct
], GridBodyComp.prototype, "init", null);
exports.GridBodyComp = GridBodyComp;
