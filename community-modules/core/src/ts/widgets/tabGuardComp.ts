import { Component } from "./component";
import { isNodeOrElement } from "../utils/dom";
import { TabGuardFeature, ITabGuard } from "./tabGuardFeature";

export class TabGuardComp extends Component {

    private eTopGuard: HTMLElement;
    private eBottomGuard: HTMLElement;
    private eFocusableElement: HTMLElement;

    protected tabGuardFeature: TabGuardFeature;

    protected initialiseTabGuard(params: {
        eFocusableElement?: HTMLElement,
        focusInnerElement?: (fromBottom: boolean) => void;
        shouldStopEventPropagation?: () => boolean;
        onFocusIn?: (e: FocusEvent) => void;
        onFocusOut?: (e: FocusEvent) => void;
        onTabKeyDown?: (e: KeyboardEvent) => void;
        handleKeyDown?: (e: KeyboardEvent) => void;
    }) {
        this.eTopGuard = this.createTabGuard('top');
        this.eBottomGuard = this.createTabGuard('bottom');
        this.eFocusableElement = params.eFocusableElement || this.getGui();

        const tabGuards = [this.eTopGuard, this.eBottomGuard];

        const compProxy: ITabGuard = {
            setTabIndex: tabIndex => {
                tabGuards.forEach( tabGuard => tabIndex!=null ? tabGuard.setAttribute('tabIndex', tabIndex) : tabGuard.removeAttribute('tabIndex'));
            }
        }

        this.addTabGuards();

        this.tabGuardFeature = this.createManagedBean(new TabGuardFeature({
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

    public forceFocusOutOfContainer(): void {
        this.tabGuardFeature.forceFocusOutOfContainer();
    }

    public appendChild(newChild: HTMLElement | Component, container?: HTMLElement): void {
        if (!isNodeOrElement(newChild)) {
            newChild = (newChild as Component).getGui();
        }

        const { eBottomGuard: bottomTabGuard } = this;

        if (bottomTabGuard) {
            bottomTabGuard.insertAdjacentElement('beforebegin', newChild as HTMLElement);
        } else {
            super.appendChild(newChild, container);
        }
    }

    private createTabGuard(side: 'top' | 'bottom'): HTMLElement {
        const tabGuard = document.createElement('div');

        tabGuard.classList.add('ag-tab-guard');
        tabGuard.classList.add(`ag-tab-guard-${side}`);
        tabGuard.setAttribute('role', 'presentation');

        return tabGuard;
    }

    private addTabGuards(): void {
        this.eFocusableElement.insertAdjacentElement('afterbegin', this.eTopGuard);
        this.eFocusableElement.insertAdjacentElement('beforeend', this.eBottomGuard);
    }

    protected removeAllChildrenExceptTabGuards(): void {
        const eGui = this.getGui();

        const allChildrenToRemove: any[] = [];
        for (var i = 0; i<eGui.children.length; i++) {
            const child = eGui.children[i];
            if (child!=this.eTopGuard && child!=this.eBottomGuard) {
                allChildrenToRemove.push(child);
            }
        }

        allChildrenToRemove.forEach(child => eGui.removeChild(child));
    }
}