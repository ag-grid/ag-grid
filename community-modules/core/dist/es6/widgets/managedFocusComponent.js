/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
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
import { PostConstruct, Autowired } from '../context/context';
import { Component } from './component';
import { isNodeOrElement, addCssClass, clearElement } from '../utils/dom';
import { KeyCode } from '../constants/keyCode';
import { isStopPropagationForAgGrid, stopPropagationForAgGrid } from '../utils/event';
/**
 * This provides logic to override the default browser focus logic.
 *
 * When the component gets focus, it uses the grid logic to find out what should be focused,
 * and then focuses that instead.
 *
 * This is how we ensure when user tabs into the relevant section, we focus the correct item.
 * For example GridCore extends ManagedFocusComponent, and it ensures when it receives focus
 * that focus goes to the first cell of the first header row.
 */
var ManagedFocusComponent = /** @class */ (function (_super) {
    __extends(ManagedFocusComponent, _super);
    /*
     * Set isFocusableContainer to true if this component will contain multiple focus-managed
     * elements within. When set to true, this component will add tabGuards that will be responsible
     * for receiving focus from outside and focusing an internal element using the focusInnerElementMethod
     */
    function ManagedFocusComponent(template, isFocusableContainer) {
        if (isFocusableContainer === void 0) { isFocusableContainer = false; }
        var _this = _super.call(this, template) || this;
        _this.isFocusableContainer = isFocusableContainer;
        _this.skipTabGuardFocus = false;
        return _this;
    }
    ManagedFocusComponent.prototype.postConstruct = function () {
        var _this = this;
        var focusableElement = this.getFocusableElement();
        if (!focusableElement) {
            return;
        }
        addCssClass(focusableElement, ManagedFocusComponent.FOCUS_MANAGED_CLASS);
        if (this.isFocusableContainer) {
            this.topTabGuard = this.createTabGuard('top');
            this.bottomTabGuard = this.createTabGuard('bottom');
            this.addTabGuards();
            this.activateTabGuards();
            this.forEachTabGuard(function (guard) { return _this.addManagedListener(guard, 'focus', _this.onFocus.bind(_this)); });
        }
        this.addKeyDownListeners(focusableElement);
        this.addManagedListener(focusableElement, 'focusin', this.onFocusIn.bind(this));
        this.addManagedListener(focusableElement, 'focusout', this.onFocusOut.bind(this));
    };
    /*
     * Override this method if focusing the default element requires special logic.
     */
    ManagedFocusComponent.prototype.focusInnerElement = function (fromBottom) {
        if (fromBottom === void 0) { fromBottom = false; }
        var focusable = this.focusController.findFocusableElements(this.getFocusableElement());
        if (this.isFocusableContainer && this.tabGuardsAreActive()) {
            // remove tab guards from this component from list of focusable elements
            focusable.splice(0, 1);
            focusable.splice(focusable.length - 1, 1);
        }
        if (!focusable.length) {
            return;
        }
        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    };
    /**
     * By default this will tab though the elements in the default order. Override if you require special logic.
     */
    ManagedFocusComponent.prototype.onTabKeyDown = function (e) {
        var _this = this;
        if (e.defaultPrevented) {
            return;
        }
        var tabGuardsAreActive = this.tabGuardsAreActive();
        if (this.isFocusableContainer && tabGuardsAreActive) {
            this.deactivateTabGuards();
        }
        var nextRoot = this.focusController.findNextFocusableElement(this.getFocusableElement(), false, e.shiftKey);
        if (this.isFocusableContainer && tabGuardsAreActive) {
            // ensure the tab guards are only re-instated once the event has finished processing, to avoid the browser
            // tabbing to the tab guard from inside the component
            setTimeout(function () { return _this.activateTabGuards(); }, 0);
        }
        if (!nextRoot) {
            return;
        }
        nextRoot.focus();
        e.preventDefault();
    };
    ManagedFocusComponent.prototype.onFocusIn = function (e) {
        if (this.isFocusableContainer) {
            this.deactivateTabGuards();
        }
    };
    ManagedFocusComponent.prototype.onFocusOut = function (e) {
        if (this.isFocusableContainer && !this.getFocusableElement().contains(e.relatedTarget)) {
            this.activateTabGuards();
        }
    };
    ManagedFocusComponent.prototype.forceFocusOutOfContainer = function (up) {
        if (up === void 0) { up = false; }
        if (!this.isFocusableContainer) {
            return;
        }
        this.activateTabGuards();
        this.skipTabGuardFocus = true;
        var tabGuardToFocus = up ? this.topTabGuard : this.bottomTabGuard;
        if (tabGuardToFocus) {
            tabGuardToFocus.focus();
        }
    };
    ManagedFocusComponent.prototype.appendChild = function (newChild, container) {
        if (this.isFocusableContainer) {
            if (!isNodeOrElement(newChild)) {
                newChild = newChild.getGui();
            }
            var bottomTabGuard = this.bottomTabGuard;
            if (bottomTabGuard) {
                bottomTabGuard.insertAdjacentElement('beforebegin', newChild);
            }
            else {
                _super.prototype.appendChild.call(this, newChild, container);
            }
        }
        else {
            _super.prototype.appendChild.call(this, newChild, container);
        }
    };
    ManagedFocusComponent.prototype.createTabGuard = function (side) {
        var tabGuard = document.createElement('div');
        tabGuard.classList.add('ag-tab-guard');
        tabGuard.classList.add("ag-tab-guard-" + side);
        tabGuard.setAttribute('role', 'presentation');
        return tabGuard;
    };
    ManagedFocusComponent.prototype.addTabGuards = function () {
        var focusableEl = this.getFocusableElement();
        focusableEl.insertAdjacentElement('afterbegin', this.topTabGuard);
        focusableEl.insertAdjacentElement('beforeend', this.bottomTabGuard);
    };
    ManagedFocusComponent.prototype.forEachTabGuard = function (callback) {
        if (this.topTabGuard) {
            callback(this.topTabGuard);
        }
        if (this.bottomTabGuard) {
            callback(this.bottomTabGuard);
        }
    };
    ManagedFocusComponent.prototype.addKeyDownListeners = function (eGui) {
        var _this = this;
        this.addManagedListener(eGui, 'keydown', function (e) {
            if (e.defaultPrevented || isStopPropagationForAgGrid(e)) {
                return;
            }
            if (_this.shouldStopEventPropagation(e)) {
                stopPropagationForAgGrid(e);
                return;
            }
            if (e.keyCode === KeyCode.TAB) {
                _this.onTabKeyDown(e);
            }
            else if (_this.handleKeyDown) {
                _this.handleKeyDown(e);
            }
        });
    };
    ManagedFocusComponent.prototype.shouldStopEventPropagation = function (e) {
        return false;
    };
    ManagedFocusComponent.prototype.onFocus = function (e) {
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }
        this.focusInnerElement(e.target === this.bottomTabGuard);
    };
    ManagedFocusComponent.prototype.activateTabGuards = function () {
        var _this = this;
        this.forEachTabGuard(function (guard) { return guard.setAttribute('tabIndex', _this.gridOptionsWrapper.getGridTabIndex()); });
    };
    ManagedFocusComponent.prototype.deactivateTabGuards = function () {
        this.forEachTabGuard(function (guard) { return guard.removeAttribute('tabIndex'); });
    };
    ManagedFocusComponent.prototype.tabGuardsAreActive = function () {
        return !!this.topTabGuard && this.topTabGuard.hasAttribute('tabIndex');
    };
    ManagedFocusComponent.prototype.clearGui = function () {
        var tabGuardsAreActive = this.tabGuardsAreActive();
        clearElement(this.getFocusableElement());
        if (this.isFocusableContainer) {
            this.addTabGuards();
            if (tabGuardsAreActive) {
                this.activateTabGuards();
            }
        }
    };
    ManagedFocusComponent.FOCUS_MANAGED_CLASS = 'ag-focus-managed';
    __decorate([
        Autowired('focusController')
    ], ManagedFocusComponent.prototype, "focusController", void 0);
    __decorate([
        PostConstruct
    ], ManagedFocusComponent.prototype, "postConstruct", null);
    return ManagedFocusComponent;
}(Component));
export { ManagedFocusComponent };
