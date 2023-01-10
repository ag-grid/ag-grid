/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.0.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { PostConstruct, Autowired } from '../context/context';
import { KeyCode } from '../constants/keyCode';
import { isStopPropagationForAgGrid, stopPropagationForAgGrid } from '../utils/event';
import { BeanStub } from '../context/beanStub';
var ManagedFocusFeature = /** @class */ (function (_super) {
    __extends(ManagedFocusFeature, _super);
    function ManagedFocusFeature(eFocusableElement, callbacks) {
        if (callbacks === void 0) { callbacks = {}; }
        var _this = _super.call(this) || this;
        _this.eFocusableElement = eFocusableElement;
        _this.callbacks = callbacks;
        _this.callbacks = __assign({ shouldStopEventPropagation: function () { return false; }, onTabKeyDown: function (e) {
                if (e.defaultPrevented) {
                    return;
                }
                var nextRoot = _this.focusService.findNextFocusableElement(_this.eFocusableElement, false, e.shiftKey);
                if (!nextRoot) {
                    return;
                }
                nextRoot.focus();
                e.preventDefault();
            } }, callbacks);
        return _this;
    }
    ManagedFocusFeature.prototype.postConstruct = function () {
        this.eFocusableElement.classList.add(ManagedFocusFeature.FOCUS_MANAGED_CLASS);
        this.addKeyDownListeners(this.eFocusableElement);
        if (this.callbacks.onFocusIn) {
            this.addManagedListener(this.eFocusableElement, 'focusin', this.callbacks.onFocusIn);
        }
        if (this.callbacks.onFocusOut) {
            this.addManagedListener(this.eFocusableElement, 'focusout', this.callbacks.onFocusOut);
        }
    };
    ManagedFocusFeature.prototype.addKeyDownListeners = function (eGui) {
        var _this = this;
        this.addManagedListener(eGui, 'keydown', function (e) {
            if (e.defaultPrevented || isStopPropagationForAgGrid(e)) {
                return;
            }
            if (_this.callbacks.shouldStopEventPropagation(e)) {
                stopPropagationForAgGrid(e);
                return;
            }
            if (e.key === KeyCode.TAB) {
                _this.callbacks.onTabKeyDown(e);
            }
            else if (_this.callbacks.handleKeyDown) {
                _this.callbacks.handleKeyDown(e);
            }
        });
    };
    ManagedFocusFeature.FOCUS_MANAGED_CLASS = 'ag-focus-managed';
    __decorate([
        Autowired('focusService')
    ], ManagedFocusFeature.prototype, "focusService", void 0);
    __decorate([
        PostConstruct
    ], ManagedFocusFeature.prototype, "postConstruct", null);
    return ManagedFocusFeature;
}(BeanStub));
export { ManagedFocusFeature };
