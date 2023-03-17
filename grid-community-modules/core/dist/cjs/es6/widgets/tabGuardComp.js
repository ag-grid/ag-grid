/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabGuardComp = void 0;
const component_1 = require("./component");
const dom_1 = require("../utils/dom");
const tabGuardCtrl_1 = require("./tabGuardCtrl");
const aria_1 = require("../utils/aria");
class TabGuardComp extends component_1.Component {
    initialiseTabGuard(params) {
        this.eTopGuard = this.createTabGuard('top');
        this.eBottomGuard = this.createTabGuard('bottom');
        this.eFocusableElement = this.getFocusableElement();
        const tabGuards = [this.eTopGuard, this.eBottomGuard];
        const compProxy = {
            setTabIndex: tabIndex => {
                tabGuards.forEach(tabGuard => tabIndex != null ? tabGuard.setAttribute('tabIndex', tabIndex) : tabGuard.removeAttribute('tabIndex'));
            }
        };
        this.addTabGuards(this.eTopGuard, this.eBottomGuard);
        this.tabGuardCtrl = this.createManagedBean(new tabGuardCtrl_1.TabGuardCtrl({
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
    }
    createTabGuard(side) {
        const tabGuard = document.createElement('div');
        const cls = side === 'top' ? tabGuardCtrl_1.TabGuardClassNames.TAB_GUARD_TOP : tabGuardCtrl_1.TabGuardClassNames.TAB_GUARD_BOTTOM;
        tabGuard.classList.add(tabGuardCtrl_1.TabGuardClassNames.TAB_GUARD, cls);
        aria_1.setAriaRole(tabGuard, 'presentation');
        return tabGuard;
    }
    addTabGuards(topTabGuard, bottomTabGuard) {
        this.eFocusableElement.insertAdjacentElement('afterbegin', topTabGuard);
        this.eFocusableElement.insertAdjacentElement('beforeend', bottomTabGuard);
    }
    removeAllChildrenExceptTabGuards() {
        const tabGuards = [this.eTopGuard, this.eBottomGuard];
        dom_1.clearElement(this.getFocusableElement());
        this.addTabGuards(...tabGuards);
    }
    forceFocusOutOfContainer(up = false) {
        this.tabGuardCtrl.forceFocusOutOfContainer(up);
    }
    appendChild(newChild, container) {
        if (!dom_1.isNodeOrElement(newChild)) {
            newChild = newChild.getGui();
        }
        const { eBottomGuard: bottomTabGuard } = this;
        if (bottomTabGuard) {
            bottomTabGuard.insertAdjacentElement('beforebegin', newChild);
        }
        else {
            super.appendChild(newChild, container);
        }
    }
}
exports.TabGuardComp = TabGuardComp;
