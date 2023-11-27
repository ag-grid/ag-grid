"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FakeVScrollComp = void 0;
const context_1 = require("../context/context");
const abstractFakeScrollComp_1 = require("./abstractFakeScrollComp");
const dom_1 = require("../utils/dom");
const setHeightFeature_1 = require("./rowContainer/setHeightFeature");
const eventKeys_1 = require("../eventKeys");
class FakeVScrollComp extends abstractFakeScrollComp_1.AbstractFakeScrollComp {
    constructor() {
        super(FakeVScrollComp.TEMPLATE, 'vertical');
    }
    postConstruct() {
        super.postConstruct();
        this.createManagedBean(new setHeightFeature_1.SetHeightFeature(this.eContainer));
        this.ctrlsService.registerFakeVScrollComp(this);
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_ROW_CONTAINER_HEIGHT_CHANGED, this.onRowContainerHeightChanged.bind(this));
    }
    setScrollVisible() {
        const vScrollShowing = this.scrollVisibleService.isVerticalScrollShowing();
        const invisibleScrollbar = this.invisibleScrollbar;
        const scrollbarWidth = vScrollShowing ? (this.gridOptionsService.getScrollbarWidth() || 0) : 0;
        const adjustedScrollbarWidth = (scrollbarWidth === 0 && invisibleScrollbar) ? 16 : scrollbarWidth;
        this.addOrRemoveCssClass('ag-scrollbar-invisible', invisibleScrollbar);
        (0, dom_1.setFixedWidth)(this.getGui(), adjustedScrollbarWidth);
        (0, dom_1.setFixedWidth)(this.eViewport, adjustedScrollbarWidth);
        (0, dom_1.setFixedWidth)(this.eContainer, adjustedScrollbarWidth);
        this.setDisplayed(vScrollShowing, { skipAriaHidden: true });
    }
    onRowContainerHeightChanged() {
        const gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        const gridBodyViewportEl = gridBodyCtrl.getBodyViewportElement();
        if (this.eViewport.scrollTop != gridBodyViewportEl.scrollTop) {
            this.eViewport.scrollTop = gridBodyViewportEl.scrollTop;
        }
    }
    getScrollPosition() {
        return this.getViewport().scrollTop;
    }
    setScrollPosition(value) {
        if (!(0, dom_1.isVisible)(this.getViewport())) {
            this.attemptSettingScrollPosition(value);
        }
        this.getViewport().scrollTop = value;
    }
}
FakeVScrollComp.TEMPLATE = `<div class="ag-body-vertical-scroll" aria-hidden="true">
            <div class="ag-body-vertical-scroll-viewport" ref="eViewport">
                <div class="ag-body-vertical-scroll-container" ref="eContainer"></div>
            </div>
        </div>`;
__decorate([
    context_1.PostConstruct
], FakeVScrollComp.prototype, "postConstruct", null);
exports.FakeVScrollComp = FakeVScrollComp;
