/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.2.1
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../context/context");
var component_1 = require("./component");
var constants_1 = require("../constants");
var utils_1 = require("../utils");
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
    function ManagedFocusComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.skipTabGuardFocus = false;
        return _this;
    }
    ManagedFocusComponent.prototype.postConstruct = function () {
        var focusableElement = this.getFocusableElement();
        if (!focusableElement) {
            return;
        }
        this.wireFocusManagement();
    };
    ManagedFocusComponent.prototype.wireFocusManagement = function () {
        var _this = this;
        var focusableElement = this.getFocusableElement();
        utils_1._.addCssClass(focusableElement, ManagedFocusComponent.FOCUS_MANAGED_CLASS);
        if (this.isFocusableContainer()) {
            this.topTabGuard = this.createTabGuard('top');
            this.bottomTabGuard = this.createTabGuard('bottom');
            this.addTabGuards();
            this.activateTabGuards();
            this.forEachTabGuard(function (tabGuards) {
                _this.addManagedListener(tabGuards, 'focus', _this.onFocus.bind(_this));
            });
        }
        if (this.onTabKeyDown || this.handleKeyDown) {
            this.addKeyDownListeners(focusableElement);
        }
        this.addManagedListener(focusableElement, 'focusin', this.onFocusIn.bind(this));
        this.addManagedListener(focusableElement, 'focusout', this.onFocusOut.bind(this));
    };
    /*
     * Override this method to return true if this component will contain multiple focus-managed
     * elements within. When set to true, this component will add tabGuards that will be responsible
     * for receiving focus from outside and focusing an internal element using the focusInnerElementMethod
     */
    ManagedFocusComponent.prototype.isFocusableContainer = function () {
        return false;
    };
    /*
     * Override this method if focusing the default element requires special logic.
     */
    ManagedFocusComponent.prototype.focusInnerElement = function (fromBottom) {
        var focusable = this.focusController.findFocusableElements(this.getFocusableElement(), '.ag-tab-guard, :not([tabindex="-1"])');
        if (!focusable.length) {
            return;
        }
        focusable[fromBottom ? focusable.length - 1 : 0].focus();
    };
    ManagedFocusComponent.prototype.onFocusIn = function (e) {
        if (!this.isFocusableContainer()) {
            return;
        }
        this.deactivateTabGuards();
    };
    ManagedFocusComponent.prototype.onFocusOut = function (e) {
        if (!this.isFocusableContainer()) {
            return;
        }
        var focusEl = this.getFocusableElement();
        if (!focusEl.contains(e.relatedTarget)) {
            this.activateTabGuards();
        }
    };
    ManagedFocusComponent.prototype.forceFocusOutOfContainer = function () {
        this.activateTabGuards();
        this.skipTabGuardFocus = true;
        this.bottomTabGuard.focus();
    };
    ManagedFocusComponent.prototype.appendChild = function (newChild, container) {
        if (!this.isFocusableContainer()) {
            _super.prototype.appendChild.call(this, newChild, container);
        }
        else {
            if (!utils_1._.isNodeOrElement(newChild)) {
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
    };
    ManagedFocusComponent.prototype.createTabGuard = function (side) {
        var tabGuard = document.createElement('div');
        tabGuard.classList.add('ag-tab-guard');
        tabGuard.classList.add("ag-tab-guard-" + side);
        return tabGuard;
    };
    ManagedFocusComponent.prototype.addTabGuards = function () {
        var focusableEl = this.getFocusableElement();
        focusableEl.insertAdjacentElement('afterbegin', this.topTabGuard);
        focusableEl.insertAdjacentElement('beforeend', this.bottomTabGuard);
    };
    ManagedFocusComponent.prototype.forEachTabGuard = function (callback) {
        [this.topTabGuard, this.bottomTabGuard].forEach(callback);
    };
    ManagedFocusComponent.prototype.addKeyDownListeners = function (eGui) {
        var _this = this;
        this.addManagedListener(eGui, 'keydown', function (e) {
            if (e.defaultPrevented) {
                return;
            }
            if (e.keyCode === constants_1.Constants.KEY_TAB && _this.onTabKeyDown) {
                _this.onTabKeyDown(e);
            }
            else if (_this.handleKeyDown) {
                _this.handleKeyDown(e);
            }
        });
    };
    ManagedFocusComponent.prototype.onFocus = function (e) {
        if (!this.isFocusableContainer()) {
            return;
        }
        if (this.skipTabGuardFocus) {
            this.skipTabGuardFocus = false;
            return;
        }
        this.focusInnerElement(e.target === this.bottomTabGuard);
    };
    ManagedFocusComponent.prototype.activateTabGuards = function () {
        this.forEachTabGuard(function (tabGuard) { return tabGuard.setAttribute('tabIndex', '0'); });
    };
    ManagedFocusComponent.prototype.deactivateTabGuards = function () {
        this.forEachTabGuard(function (tabGuards) { return tabGuards.removeAttribute('tabindex'); });
    };
    ManagedFocusComponent.FOCUS_MANAGED_CLASS = 'ag-focus-managed';
    __decorate([
        context_1.Autowired('focusController')
    ], ManagedFocusComponent.prototype, "focusController", void 0);
    __decorate([
        context_1.PostConstruct
    ], ManagedFocusComponent.prototype, "postConstruct", null);
    return ManagedFocusComponent;
}(component_1.Component));
exports.ManagedFocusComponent = ManagedFocusComponent;

//# sourceMappingURL=managedFocusComponent.js.map
