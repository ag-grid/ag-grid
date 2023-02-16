/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired } from "../context/context";
import { Events } from "../eventKeys";
import { isInvisibleScrollbar, isIOSUserAgent, isMacOsUserAgent } from "../utils/browser";
import { Component } from "../widgets/component";
import { RefSelector } from "../widgets/componentAnnotations";
export class AbstractFakeScrollComp extends Component {
    constructor(template, direction) {
        super(template);
        this.direction = direction;
        this.hideTimeout = null;
    }
    postConstruct() {
        this.addManagedListener(this.eventService, Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this));
        this.onScrollVisibilityChanged();
        this.addOrRemoveCssClass('ag-apple-scrollbar', isMacOsUserAgent() || isIOSUserAgent());
    }
    initialiseInvisibleScrollbar() {
        if (this.invisibleScrollbar !== undefined) {
            return;
        }
        this.invisibleScrollbar = isInvisibleScrollbar();
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
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL, (params) => {
            if (params.direction === this.direction) {
                if (this.hideTimeout !== null) {
                    window.clearInterval(this.hideTimeout);
                    this.hideTimeout = null;
                }
                this.addOrRemoveCssClass('ag-scrollbar-scrolling', true);
            }
        });
        this.addManagedListener(this.eventService, Events.EVENT_BODY_SCROLL_END, () => {
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
    RefSelector('eViewport')
], AbstractFakeScrollComp.prototype, "eViewport", void 0);
__decorate([
    RefSelector('eContainer')
], AbstractFakeScrollComp.prototype, "eContainer", void 0);
__decorate([
    Autowired('scrollVisibleService')
], AbstractFakeScrollComp.prototype, "scrollVisibleService", void 0);
__decorate([
    Autowired('ctrlsService')
], AbstractFakeScrollComp.prototype, "ctrlsService", void 0);
