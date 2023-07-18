import { Component } from "./component.mjs";
import { isNodeOrElement, clearElement } from "../utils/dom.mjs";
import { TabGuardCtrl, TabGuardClassNames } from "./tabGuardCtrl.mjs";
import { setAriaRole } from "../utils/aria.mjs";
export class TabGuardComp extends Component {
    initialiseTabGuard(params) {
        this.eTopGuard = this.createTabGuard('top');
        this.eBottomGuard = this.createTabGuard('bottom');
        this.eFocusableElement = this.getFocusableElement();
        const tabGuards = [this.eTopGuard, this.eBottomGuard];
        const compProxy = {
            setTabIndex: tabIndex => {
                tabGuards.forEach(tabGuard => tabIndex != null ? tabGuard.setAttribute('tabindex', tabIndex) : tabGuard.removeAttribute('tabindex'));
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
    }
    createTabGuard(side) {
        const tabGuard = document.createElement('div');
        const cls = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;
        tabGuard.classList.add(TabGuardClassNames.TAB_GUARD, cls);
        setAriaRole(tabGuard, 'presentation');
        return tabGuard;
    }
    addTabGuards(topTabGuard, bottomTabGuard) {
        this.eFocusableElement.insertAdjacentElement('afterbegin', topTabGuard);
        this.eFocusableElement.insertAdjacentElement('beforeend', bottomTabGuard);
    }
    removeAllChildrenExceptTabGuards() {
        const tabGuards = [this.eTopGuard, this.eBottomGuard];
        clearElement(this.getFocusableElement());
        this.addTabGuards(...tabGuards);
    }
    forceFocusOutOfContainer(up = false) {
        this.tabGuardCtrl.forceFocusOutOfContainer(up);
    }
    appendChild(newChild, container) {
        if (!isNodeOrElement(newChild)) {
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
