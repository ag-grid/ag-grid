"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabGuardCtrl = exports.TabGuardClassNames = void 0;
const beanStub_1 = require("../context/beanStub");
const context_1 = require("../context/context");
const managedFocusFeature_1 = require("./managedFocusFeature");
var TabGuardClassNames;
(function (TabGuardClassNames) {
    TabGuardClassNames["TAB_GUARD"] = "ag-tab-guard";
    TabGuardClassNames["TAB_GUARD_TOP"] = "ag-tab-guard-top";
    TabGuardClassNames["TAB_GUARD_BOTTOM"] = "ag-tab-guard-bottom";
})(TabGuardClassNames = exports.TabGuardClassNames || (exports.TabGuardClassNames = {}));
;
class TabGuardCtrl extends beanStub_1.BeanStub {
    constructor(params) {
        super();
        this.skipTabGuardFocus = false;
        this.forcingFocusOut = false;
        const { comp, eTopGuard, eBottomGuard, focusTrapActive, forceFocusOutWhenTabGuardsAreEmpty, focusInnerElement, onFocusIn, onFocusOut, shouldStopEventPropagation, onTabKeyDown, handleKeyDown, eFocusableElement } = params;
        this.comp = comp;
        this.eTopGuard = eTopGuard;
        this.eBottomGuard = eBottomGuard;
        this.providedFocusInnerElement = focusInnerElement;
        this.eFocusableElement = eFocusableElement;
        this.focusTrapActive = !!focusTrapActive;
        this.forceFocusOutWhenTabGuardsAreEmpty = !!forceFocusOutWhenTabGuardsAreEmpty;
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
        // Do not activate tabs while focus is being forced out
        if (this.forcingFocusOut) {
            return;
        }
        const tabIndex = this.gridOptionsService.get('tabIndex');
        this.comp.setTabIndex(tabIndex.toString());
    }
    deactivateTabGuards() {
        this.comp.setTabIndex();
    }
    onFocus(e) {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }
        // when there are no focusable items within the TabGuard, focus gets stuck
        // in the TabGuard itself and has nowhere to go, so we need to manually find
        // the closest element to focus by calling `forceFocusOutWhenTabGuardAreEmpty`.
        if (this.forceFocusOutWhenTabGuardsAreEmpty) {
            const isEmpty = this.focusService.findFocusableElements(this.eFocusableElement, '.ag-tab-guard').length === 0;
            if (isEmpty) {
                this.findNextElementOutsideAndFocus(e.target === this.eBottomGuard);
                return;
            }
        }
        const fromBottom = e.target === this.eBottomGuard;
        if (this.providedFocusInnerElement) {
            this.providedFocusInnerElement(fromBottom);
        }
        else {
            this.focusInnerElement(fromBottom);
        }
    }
    findNextElementOutsideAndFocus(up) {
        const eDocument = this.gridOptionsService.getDocument();
        const focusableEls = this.focusService.findFocusableElements(eDocument.body, null, true);
        const index = focusableEls.indexOf(up ? this.eTopGuard : this.eBottomGuard);
        if (index === -1) {
            return;
        }
        let start;
        let end;
        if (up) {
            start = 0;
            end = index;
        }
        else {
            start = index + 1;
            end = focusableEls.length;
        }
        const focusableRange = focusableEls.slice(start, end);
        const targetTabIndex = this.gridOptionsService.get('tabIndex');
        focusableRange.sort((a, b) => {
            const indexA = parseInt(a.getAttribute('tabindex') || '0');
            const indexB = parseInt(b.getAttribute('tabindex') || '0');
            if (indexB === targetTabIndex) {
                return 1;
            }
            if (indexA === targetTabIndex) {
                return -1;
            }
            if (indexA === 0) {
                return 1;
            }
            if (indexB === 0) {
                return -1;
            }
            return indexA - indexB;
        });
        focusableRange[up ? (focusableRange.length - 1) : 0].focus();
    }
    onFocusIn(e) {
        if (this.focusTrapActive) {
            return;
        }
        if (this.providedFocusIn) {
            this.providedFocusIn(e);
        }
        this.deactivateTabGuards();
    }
    onFocusOut(e) {
        if (this.focusTrapActive) {
            return;
        }
        if (this.providedFocusOut) {
            this.providedFocusOut(e);
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
        if (this.focusTrapActive) {
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
        focusable[fromBottom ? focusable.length - 1 : 0].focus({ preventScroll: true });
    }
    getNextFocusableElement(backwards) {
        return this.focusService.findNextFocusableElement(this.eFocusableElement, false, backwards);
    }
    forceFocusOutOfContainer(up = false) {
        // avoid multiple calls to `forceFocusOutOfContainer`
        if (this.forcingFocusOut) {
            return;
        }
        const tabGuardToFocus = up ? this.eTopGuard : this.eBottomGuard;
        this.activateTabGuards();
        this.skipTabGuardFocus = true;
        this.forcingFocusOut = true;
        // this focus will set `this.skipTabGuardFocus` to false;
        tabGuardToFocus.focus();
        window.setTimeout(() => {
            this.forcingFocusOut = false;
            this.activateTabGuards();
        });
    }
    isTabGuard(element) {
        return element === this.eTopGuard || element === this.eBottomGuard;
    }
}
__decorate([
    (0, context_1.Autowired)('focusService')
], TabGuardCtrl.prototype, "focusService", void 0);
__decorate([
    context_1.PostConstruct
], TabGuardCtrl.prototype, "postConstruct", null);
exports.TabGuardCtrl = TabGuardCtrl;
