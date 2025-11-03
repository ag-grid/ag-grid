import { AgBeanStub } from '../core/agBeanStub';
import type { AgComponent } from '../interfaces/agComponent';
import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IPropertiesService } from '../interfaces/iProperties';
import { _setAriaRole } from '../utils/aria';
import { _getDocument } from '../utils/document';
import { _clearElement, _isNodeOrElement, _removeFromParent } from '../utils/dom';
import type { StopPropagationCallbacks } from './agManagedFocusFeature';
import type { ITabGuard } from './tabGuardCtrl';
import { AgTabGuardCtrl, TabGuardClassNames } from './tabGuardCtrl';

export interface AgTabGuardParams {
    focusInnerElement?: (fromBottom: boolean) => boolean;
    shouldStopEventPropagation?: () => boolean;
    /**
     * @returns `true` to prevent the default onFocusIn behavior
     */
    onFocusIn?: (e: FocusEvent) => void;
    /**
     * @returns `true` to prevent the default onFocusOut behavior
     */
    onFocusOut?: (e: FocusEvent) => void;
    onTabKeyDown?: (e: KeyboardEvent) => void;
    handleKeyDown?: (e: KeyboardEvent) => void;
    /**
     * By default will check for focusable elements to see if empty.
     * Provide this to override.
     */
    isEmpty?: () => boolean;
    /**
     * Set to true to create a circular focus pattern when keyboard tabbing.
     */
    focusTrapActive?: boolean;
    /**
     * Set to true to find a focusable element outside of the TabGuards to focus
     */
    forceFocusOutWhenTabGuardsAreEmpty?: boolean;
    isFocusableContainer?: boolean;
}

export class AgTabGuardFeature<
    TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
> extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
    private eTopGuard: HTMLElement;
    private eBottomGuard: HTMLElement;
    private eFocusableElement: HTMLElement;

    private tabGuardCtrl: AgTabGuardCtrl<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>;

    constructor(
        private readonly comp: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>,
        private readonly stopPropagationCallbacks?: StopPropagationCallbacks
    ) {
        super();
    }

    public initialiseTabGuard(params: AgTabGuardParams) {
        this.eTopGuard = this.createTabGuard('top');
        this.eBottomGuard = this.createTabGuard('bottom');
        this.eFocusableElement = this.comp.getFocusableElement();

        const { eTopGuard, eBottomGuard, eFocusableElement, stopPropagationCallbacks } = this;

        const tabGuards = [eTopGuard, eBottomGuard];

        const compProxy: ITabGuard = {
            setTabIndex: (tabIndex) => {
                for (const tabGuard of tabGuards) {
                    tabIndex == null
                        ? tabGuard.removeAttribute('tabindex')
                        : tabGuard.setAttribute('tabindex', tabIndex);
                }
            },
        };

        this.addTabGuards(eTopGuard, eBottomGuard);

        const {
            focusTrapActive = false,
            onFocusIn,
            onFocusOut,
            focusInnerElement,
            handleKeyDown,
            onTabKeyDown,
            shouldStopEventPropagation,
            isEmpty,
            forceFocusOutWhenTabGuardsAreEmpty,
            isFocusableContainer,
        } = params;

        this.tabGuardCtrl = this.createManagedBean(
            new AgTabGuardCtrl(
                {
                    comp: compProxy,
                    focusTrapActive,
                    eTopGuard,
                    eBottomGuard,
                    eFocusableElement,
                    onFocusIn,
                    onFocusOut,
                    focusInnerElement,
                    handleKeyDown,
                    onTabKeyDown,
                    shouldStopEventPropagation,
                    isEmpty,
                    forceFocusOutWhenTabGuardsAreEmpty,
                    isFocusableContainer,
                },
                stopPropagationCallbacks
            )
        );
    }

    public getTabGuardCtrl(): AgTabGuardCtrl<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService> {
        return this.tabGuardCtrl;
    }

    private createTabGuard(side: 'top' | 'bottom'): HTMLElement {
        const tabGuard = _getDocument(this.beans).createElement('div');
        const cls = side === 'top' ? TabGuardClassNames.TAB_GUARD_TOP : TabGuardClassNames.TAB_GUARD_BOTTOM;

        tabGuard.classList.add(TabGuardClassNames.TAB_GUARD, cls);
        _setAriaRole(tabGuard, 'presentation');

        return tabGuard;
    }

    private addTabGuards(topTabGuard: HTMLElement, bottomTabGuard: HTMLElement): void {
        const eFocusableElement = this.eFocusableElement;
        eFocusableElement.prepend(topTabGuard);
        eFocusableElement.append(bottomTabGuard);
    }

    public removeAllChildrenExceptTabGuards(): void {
        const tabGuards: [HTMLElement, HTMLElement] = [this.eTopGuard, this.eBottomGuard];
        _clearElement(this.comp.getFocusableElement());
        this.addTabGuards(...tabGuards);
    }

    public forceFocusOutOfContainer(up: boolean = false): void {
        this.tabGuardCtrl.forceFocusOutOfContainer(up);
    }

    public appendChild(
        appendChild: (
            newChild: HTMLElement | AgComponent<TBeanCollection, TProperties, TGlobalEvents, any>,
            container?: HTMLElement
        ) => void,
        newChild: AgComponent<TBeanCollection, TProperties, TGlobalEvents, any> | HTMLElement,
        container?: HTMLElement | undefined
    ): void {
        if (!_isNodeOrElement(newChild)) {
            newChild = newChild.getGui();
        }

        const { eBottomGuard: bottomTabGuard } = this;

        if (bottomTabGuard) {
            bottomTabGuard.before(newChild);
        } else {
            appendChild(newChild, container);
        }
    }

    public override destroy(): void {
        // in some places (`AgMenuPanel`) the lifecycle on the tab guard feature doesn't match
        // the lifecycle of the component gui, so remove the tab guards on destroy
        const { eTopGuard, eBottomGuard } = this;
        _removeFromParent(eTopGuard);
        _removeFromParent(eBottomGuard);
        super.destroy();
    }
}
