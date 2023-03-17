/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
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
exports.AbstractFakeScrollComp = void 0;
const context_1 = require("../context/context");
const eventKeys_1 = require("../eventKeys");
const browser_1 = require("../utils/browser");
const component_1 = require("../widgets/component");
const componentAnnotations_1 = require("../widgets/componentAnnotations");
class AbstractFakeScrollComp extends component_1.Component {
    constructor(template, direction) {
        super(template);
        this.direction = direction;
        this.hideTimeout = null;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.onScrollVisibilityChanged();
        this.addOrRemoveCssClass('ag-apple-scrollbar', browser_1.isMacOsUserAgent() || browser_1.isIOSUserAgent());
    }
    initialiseInvisibleScrollbar() {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }
        this.invisibleScrollbar = browser_1.isInvisibleScrollbar();
        if (this.invisibleScrollbar) {
            this.hideAndShowInvisibleScrollAsNeeded();
            this.addActiveListenerToggles();
        }
    }
    addActiveListenerToggles() {
        const activateEvents = ['mouseenter', 'mousedown', 'touchstart'];
        const deactivateEvents = ['mouseleave', 'touchend'];
        const eGui = this.getGui();
        activateEvents.forEach(eventName => this.addManagedListener(eGui, eventName, () => this.addOrRemoveCssClass('ag-scrollbar-active', true)));
        deactivateEvents.forEach(eventName => this.addManagedListener(eGui, eventName, () => this.addOrRemoveCssClass('ag-scrollbar-active', false)));
    }
    onScrollVisibilityChanged() {
        // initialiseInvisibleScrollbar should only be called once, but the reason
        // this can't be inside `setComp` or `PostConstruct` is the DOM might not
        // be ready, so we call it until eventually, it gets calculated.
        if (this.invisibleScrollbar === undefined) {
            this.initialiseInvisibleScrollbar();
        }
        this.setScrollVisible();
    }
    hideAndShowInvisibleScrollAsNeeded() {
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL, (params) => {
            if (params.direction === this.direction) {
                if (this.hideTimeout !== null) {
                    window.clearTimeout(this.hideTimeout);
                    this.hideTimeout = null;
                }
                this.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, eventKeys_1.Events.EVENT_BODY_SCROLL_END, () => {
            this.hideTimeout = window.setTimeout(() => {
                this.addOrRemoveCssClass('ag-scrollbar-scrolling', false);
                this.hideTimeout = null;
            }, 400);
        });
    }
    getViewport() {
        return this.eViewport;
    }
    getContainer() {
        return this.eContainer;
    }
}
__decorate([
    componentAnnotations_1.RefSelector('eViewport')
], AbstractFakeScrollComp.prototype, "eViewport", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eContainer')
], AbstractFakeScrollComp.prototype, "eContainer", void 0);
__decorate([
    context_1.Autowired('scrollVisibleService')
], AbstractFakeScrollComp.prototype, "scrollVisibleService", void 0);
__decorate([
    context_1.Autowired('ctrlsService')
], AbstractFakeScrollComp.prototype, "ctrlsService", void 0);
exports.AbstractFakeScrollComp = AbstractFakeScrollComp;
