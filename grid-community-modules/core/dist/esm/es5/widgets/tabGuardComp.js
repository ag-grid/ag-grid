var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Component } from "./component";
import { isNodeOrElement, clearElement } from "../utils/dom";
import { TabGuardCtrl, TabGuardClassNames } from "./tabGuardCtrl";
import { setAriaRole } from "../utils/aria";
var TabGuardComp = /** @class */ (function (_super) {
    __extends(TabGuardComp, _super);
    function TabGuardComp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TabGuardComp.prototype.initialiseTabGuard = function (params) {
        this.eTopGuard = this.createTabGuard('top');
        this.eBottomGuard = this.createTabGuard('bottom');
        this.eFocusableElement = this.getFocusableElement();
        var tabGuards = [this.eTopGuard, this.eBottomGuard];
        var compProxy = {
            setTabIndex: function (tabIndex) {
                tabGuards.forEach(function (tabGuard) { return tabIndex != null ? tabGuard.setAttribute('tabindex', tabIndex) : tabGuard.removeAttribute('tabindex'); });
            }
        };
        this.addTabGuards(this.eTopGuard, this.eBottomGuard);
        this.tabGuardCtrl = this.createManagedBean(new TabGuardCtrl({
            comp: compProxy,
            eTopGuard: this.eTopGuard,
            eBottomGuard: this.eBottomGuard,
            eFocusableElement: this.eFocusableElement,
            onFocusIn: params.onFocusIn,
            onFocusOut: params.onFocusOut,
            focusInnerElement: params.focusInnerElement,
            handleKeyDown: params.handleKeyDown,
            onTabKeyDown: params.onTabKeyDown,
            shouldStopEventPropagation: params.shouldStopEventPropagation
        }));
    };
    TabGuardComp.prototype.createTabGuard = function (side) {
        var tabGuard = document.createElement('div');
        var cls = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
        tabGuard.classList.add(TabGuardClassNames.TAB_GUARD, cls);
        setAriaRole(tabGuard, 'presentation');
        return tabGuard;
    };
    TabGuardComp.prototype.addTabGuards = function (topTabGuard, bottomTabGuard) {
        this.eFocusableElement.insertAdjacentElement('afterbegin', topTabGuard);
        this.eFocusableElement.insertAdjacentElement('beforeend', bottomTabGuard);
    };
    TabGuardComp.prototype.removeAllChildrenExceptTabGuards = function () {
        var tabGuards = [this.eTopGuard, this.eBottomGuard];
        clearElement(this.getFocusableElement());
        this.addTabGuards.apply(this, __spreadArray([], __read(tabGuards), false));
    };
    TabGuardComp.prototype.forceFocusOutOfContainer = function (up) {
        if (up === void 0) { up = false; }
        this.tabGuardCtrl.forceFocusOutOfContainer(up);
    };
    TabGuardComp.prototype.appendChild = function (newChild, container) {
        if (!isNodeOrElement(newChild)) {
            newChild = newChild.getGui();
        }
        var bottomTabGuard = this.eBottomGuard;
        if (bottomTabGuard) {
            bottomTabGuard.insertAdjacentElement('beforebegin', newChild);
        }
        else {
            _super.prototype.appendChild.call(this, newChild, container);
        }
    };
    return TabGuardComp;
}(Component));
export { TabGuardComp };
