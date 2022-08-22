/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.1.1
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Optional, PostConstruct } from '../context/context';
import { LayoutCssClasses } from "../styling/layoutFeature";
import { setAriaColCount, setAriaMultiSelectable, setAriaRowCount } from '../utils/aria';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { CSS_CLASS_CELL_SELECTABLE, CSS_CLASS_COLUMN_MOVING, CSS_CLASS_FORCE_VERTICAL_SCROLL, GridBodyCtrl, RowAnimationCssClasses } from "./gridBodyCtrl";
import { RowContainerName } from "./rowContainer/rowContainerCtrl";
const GRID_BODY_TEMPLATE = /* html */ `<div class="ag-root ag-unselectable" role="grid">
        <ag-header-root ref="gridHeader"></ag-header-root>
        <div class="ag-floating-top" ref="eTop" role="presentation">
            <ag-row-container ref="topLeftContainer" name="${RowContainerName.TOP_LEFT}"></ag-row-container>
            <ag-row-container ref="topCenterContainer" name="${RowContainerName.TOP_CENTER}"></ag-row-container>
            <ag-row-container ref="topRightContainer" name="${RowContainerName.TOP_RIGHT}"></ag-row-container>
            <ag-row-container ref="topFullWidthContainer" name="${RowContainerName.TOP_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-body-viewport" ref="eBodyViewport" role="presentation">
            <ag-row-container ref="leftContainer" name="${RowContainerName.LEFT}"></ag-row-container>
            <ag-row-container ref="centerContainer" name="${RowContainerName.CENTER}"></ag-row-container>
            <ag-row-container ref="rightContainer" name="${RowContainerName.RIGHT}"></ag-row-container>
            <ag-row-container ref="fullWidthContainer" name="${RowContainerName.FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-sticky-top" ref="eStickyTop" role="presentation">
            <ag-row-container ref="stickyTopLeftContainer" name="${RowContainerName.STICKY_TOP_LEFT}"></ag-row-container>
            <ag-row-container ref="stickyTopCenterContainer" name="${RowContainerName.STICKY_TOP_CENTER}"></ag-row-container>
            <ag-row-container ref="stickyTopRightContainer" name="${RowContainerName.STICKY_TOP_RIGHT}"></ag-row-container>
            <ag-row-container ref="stickyTopFullWidthContainer" name="${RowContainerName.STICKY_TOP_FULL_WIDTH}"></ag-row-container>
        </div>
        <div class="ag-floating-bottom" ref="eBottom" role="presentation">
            <ag-row-container ref="bottomLeftContainer" name="${RowContainerName.BOTTOM_LEFT}"></ag-row-container>
            <ag-row-container ref="bottomCenterContainer" name="${RowContainerName.BOTTOM_CENTER}"></ag-row-container>
            <ag-row-container ref="bottomRightContainer" name="${RowContainerName.BOTTOM_RIGHT}"></ag-row-container>
            <ag-row-container ref="bottomFullWidthContainer" name="${RowContainerName.BOTTOM_FULL_WIDTH}"></ag-row-container>
        </div>
        <ag-fake-horizontal-scroll></ag-fake-horizontal-scroll>
        <ag-overlay-wrapper></ag-overlay-wrapper>
    </div>`;
export class GridBodyComp extends Component {
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
            setColumnCount: count => setAriaColCount(this.getGui(), count),
            setRowCount: count => setAriaRowCount(this.getGui(), count),
            setTopHeight: height => setHeight(height, this.eTop),
            setBottomHeight: height => setHeight(height, this.eBottom),
            setTopDisplay: display => this.eTop.style.display = display,
            setBottomDisplay: display => this.eBottom.style.display = display,
            setStickyTopHeight: height => this.eStickyTop.style.height = height,
            setStickyTopTop: top => this.eStickyTop.style.top = top,
            setStickyTopWidth: width => this.eStickyTop.style.width = width,
            setColumnMovingCss: (cssClass, flag) => this.addOrRemoveCssClass(CSS_CLASS_COLUMN_MOVING, flag),
            updateLayoutClasses: (cssClass, params) => {
                const bodyViewportClassList = this.eBodyViewport.classList;
                bodyViewportClassList.toggle(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                bodyViewportClassList.toggle(LayoutCssClasses.NORMAL, params.normal);
                bodyViewportClassList.toggle(LayoutCssClasses.PRINT, params.print);
                this.addOrRemoveCssClass(LayoutCssClasses.AUTO_HEIGHT, params.autoHeight);
                this.addOrRemoveCssClass(LayoutCssClasses.NORMAL, params.normal);
                this.addOrRemoveCssClass(LayoutCssClasses.PRINT, params.print);
            },
            setAlwaysVerticalScrollClass: (cssClass, on) => this.eBodyViewport.classList.toggle(CSS_CLASS_FORCE_VERTICAL_SCROLL, on),
            registerBodyViewportResizeListener: listener => {
                const unsubscribeFromResize = this.resizeObserverService.observeResize(this.eBodyViewport, listener);
                this.addDestroyFunc(() => unsubscribeFromResize());
            },
            setPinnedTopBottomOverflowY: overflow => this.eTop.style.overflowY = this.eBottom.style.overflowY = overflow,
            setCellSelectableCss: (cssClass, selectable) => {
                [this.eTop, this.eBodyViewport, this.eBottom]
                    .forEach(ct => ct.classList.toggle(CSS_CLASS_CELL_SELECTABLE, selectable));
            },
        };
        this.ctrl = this.createManagedBean(new GridBodyCtrl());
        this.ctrl.setComp(compProxy, this.getGui(), this.eBodyViewport, this.eTop, this.eBottom, this.eStickyTop);
        if (this.rangeService || this.gridOptionsWrapper.isRowSelectionMulti()) {
            setAriaMultiSelectable(this.getGui(), true);
        }
    }
    setRowAnimationCssOnBodyViewport(cssClass, animateRows) {
        const bodyViewportClassList = this.eBodyViewport.classList;
        bodyViewportClassList.toggle(RowAnimationCssClasses.ANIMATION_ON, animateRows);
        bodyViewportClassList.toggle(RowAnimationCssClasses.ANIMATION_OFF, !animateRows);
    }
    getFloatingTopBottom() {
        return [this.eTop, this.eBottom];
    }
}
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
    RefSelector('eStickyTop')
], GridBodyComp.prototype, "eStickyTop", void 0);
__decorate([
    RefSelector('eTop')
], GridBodyComp.prototype, "eTop", void 0);
__decorate([
    RefSelector('eBottom')
], GridBodyComp.prototype, "eBottom", void 0);
__decorate([
    RefSelector('gridHeader')
], GridBodyComp.prototype, "headerRootComp", void 0);
__decorate([
    PostConstruct
], GridBodyComp.prototype, "init", null);
