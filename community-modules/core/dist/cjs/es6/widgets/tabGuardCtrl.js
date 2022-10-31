/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.1
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
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const managedFocusFeature_1 = require("./managedFocusFeature");
class TabGuardCtrl extends beanStub_1.BeanStub {
    constructor(params) {
        super();
        this.skipTabGuardFocus = false;
        const { comp, eTopGuard, eBottomGuard, focusInnerElement, onFocusIn, onFocusOut, shouldStopEventPropagation, onTabKeyDown, handleKeyDown, eFocusableElement } = params;
        this.comp = comp;
        this.eTopGuard = eTopGuard;
        this.eBottomGuard = eBottomGuard;
        this.providedFocusInnerElement = focusInnerElement;
        this.eFocusableElement = eFocusableElement;
        this.providedFocusIn = onFocusIn;
        this.providedFocusOut = onFocusOut;
        this.providedShouldStopEventPropagation = shouldStopEventPropagation;
        this.providedOnTabKeyDown = onTabKeyDown;
        this.providedHandleKeyDown = handleKeyDown;
    }
    postConstruct() {
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(this.eFocusableElement, {
            shouldStopEventPropagation: () => this.shouldStopEventPropagation(),
            onTabKeyDown: e => this.onTabKeyDown(e),
            handleKeyDown: e => this.handleKeyDown(e),
            onFocusIn: e => this.onFocusIn(e),
            onFocusOut: e => this.onFocusOut(e)
        }));
        this.activateTabGuards();
        [this.eTopGuard, this.eBottomGuard].forEach(guard => this.addManagedListener(guard, 'focus', this.onFocus.bind(this)));
    }
    handleKeyDown(e) {
        if (this.providedHandleKeyDown) {
            this.providedHandleKeyDown(e);
        }
    }
    tabGuardsAreActive() {
        return !!this.eTopGuard && this.eTopGuard.hasAttribute('tabIndex');
    }
    shouldStopEventPropagation() {
        if (this.providedShouldStopEventPropagation) {
            return this.providedShouldStopEventPropagation();
        }
        return false;
    }
    activateTabGuards() {
        this.comp.setTabIndex(this.getGridTabIndex());
    }
    deactivateTabGuards() {
        this.comp.setTabIndex();
    }
    onFocus(e) {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }
        const fromBottom = e.target === this.eBottomGuard;
        if (this.providedFocusInnerElement) {
            this.providedFocusInnerElement(fromBottom);
        }
        else {
            this.focusInnerElement(fromBottom);
        }
    }
    onFocusIn(e) {
        if (this.providedFocusIn && this.providedFocusIn(e)) {
            return;
        }
        this.deactivateTabGuards();
    }
    onFocusOut(e) {
        if (this.providedFocusOut && this.providedFocusOut(e)) {
            return;
        }
        if (!this.eFocusableElement.contains(e.relatedTarget)) {
            this.activateTabGuards();
        }
    }
    onTabKeyDown(e) {
        if (this.providedOnTabKeyDown) {
            this.providedOnTabKeyDown(e);
            return;
        }
        if (e.defaultPrevented) {
            return;
        }
        const tabGuardsAreActive = this.tabGuardsAreActive();
        if (tabGuardsAreActive) {
            this.deactivateTabGuards();
        }
        const nextRoot = this.getNextFocusableElement(e.shiftKey);
        if (tabGuardsAreActive) {
            // ensure the tab guards are only re-instated once the event has finished processing, to avoid the browser
            // tabbing to the tab guard from inside the component
            setTimeout(() => this.activateTabGuards(), 0);
        }
        if (!nextRoot) {
            return;
        }
        nextRoot.focus();
        e.preventDefault();
    }
    getGridTabIndex() {
        return this.gridOptionsWrapper.getGridTabIndex();
    }
    focusInnerElement(fromBottom = false) {
        const focusable = this.focusService.findFocusableElements(this.eFocusableElement);
        if (this.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(focusable.length - 1, 1);
        }
        if (!focusable.length) {
            return;
        }
        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    }
    getNextFocusableElement(backwards) {
        return this.focusService.findNextFocusableElement(this.eFocusableElement, false, backwards);
    }
    forceFocusOutOfContainer(up = false) {
        const tabGuardToFocus = up ? this.eTopGuard : this.eBottomGuard;
        this.activateTabGuards();
        this.skipTabGuardFocus = true;
        tabGuardToFocus.focus();
    }
}
__decorate([
    context_1.Autowired('focusService')
], TabGuardCtrl.prototype, "focusService", void 0);
__decorate([
    context_1.PostConstruct
], TabGuardCtrl.prototype, "postConstruct", null);
exports.TabGuardCtrl = TabGuardCtrl;
