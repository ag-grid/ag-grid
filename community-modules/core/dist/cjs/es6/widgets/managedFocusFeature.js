/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
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
const keyCode_1 = require("../constants/keyCode");
const event_1 = require("../utils/event");
const beanStub_1 = require("../context/beanStub");
class ManagedFocusFeature extends beanStub_1.BeanStub {
    constructor(eFocusableElement, callbacks = {}) {
        super();
        this.eFocusableElement = eFocusableElement;
        this.callbacks = callbacks;
        this.callbacks = Object.assign({ shouldStopEventPropagation: () => false, onTabKeyDown: (e) => {
                if (e.defaultPrevented) {
                    return;
                }
                const nextRoot = this.focusService.findNextFocusableElement(this.eFocusableElement, false, e.shiftKey);
                if (!nextRoot) {
                    return;
                }
                nextRoot.focus();
                e.preventDefault();
            } }, callbacks);
    }
    postConstruct() {
        this.eFocusableElement.classList.add(ManagedFocusFeature.FOCUS_MANAGED_CLASS);
        this.addKeyDownListeners(this.eFocusableElement);
        if (this.callbacks.onFocusIn) {
            this.addManagedListener(this.eFocusableElement, 'focusin', this.callbacks.onFocusIn);
        }
        if (this.callbacks.onFocusOut) {
            this.addManagedListener(this.eFocusableElement, 'focusout', this.callbacks.onFocusOut);
        }
    }
    addKeyDownListeners(eGui) {
        this.addManagedListener(eGui, 'keydown', (e) => {
            if (e.defaultPrevented || event_1.isStopPropagationForAgGrid(e)) {
                return;
            }
            if (this.callbacks.shouldStopEventPropagation(e)) {
                event_1.stopPropagationForAgGrid(e);
                return;
            }
            if (e.key === keyCode_1.KeyCode.TAB) {
                this.callbacks.onTabKeyDown(e);
            }
            else if (this.callbacks.handleKeyDown) {
                this.callbacks.handleKeyDown(e);
            }
        });
    }
}
ManagedFocusFeature.FOCUS_MANAGED_CLASS = 'ag-focus-managed';
__decorate([
    context_1.Autowired('focusService')
], ManagedFocusFeature.prototype, "focusService", void 0);
__decorate([
    context_1.PostConstruct
], ManagedFocusFeature.prototype, "postConstruct", null);
exports.ManagedFocusFeature = ManagedFocusFeature;
