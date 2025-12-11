import type {
    _AfterGuiAttachedParams,
    _AgCoreBeanCollection,
    _AgElementParams,
    _BaseEvents,
    _BaseProperties,
    _IPropertiesService,
} from 'ag-grid-community';
import {
    KeyCode,
    RefPlaceholder,
    _AgTabGuardComp,
    _clearElement,
    _createAgElement,
    _findNextFocusableElement,
    _focusInto,
    _getActiveDomElement,
    _getDocument,
    _isKeyboardMode,
    _setAriaLabel,
    _setAriaRole,
} from 'ag-grid-community';

import { findFocusableElementBeforeTabGuard, isTargetUnderManagedComponent } from '../misc/enterpriseFocusUtils';
import type { AgTabbedItem, AgTabbedLayoutParams } from './iTabbedLayout';

interface TabbedItemWrapper<TContainerType extends string> {
    tabbedItem: AgTabbedItem<TContainerType>;
    eHeaderButton: HTMLElement;
}

function getTabbedLayoutTemplate<TComponentSelectorType extends string>(
    cssClass?: string
): _AgElementParams<TComponentSelectorType> {
    return {
        tag: 'div',
        cls: `ag-tabs ${cssClass}`,
        children: [
            { tag: 'div', ref: 'eHeader' },
            {
                tag: 'div',
                ref: 'eBody',
                role: 'presentation',
                cls: 'ag-tabs-body' + cssClass ? ` ${cssClass}-body` : '',
            },
        ],
    };
}

export class AgTabbedLayout<
    TBeanCollection extends _AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
    TProperties extends _BaseProperties,
    TGlobalEvents extends _BaseEvents,
    TCommon,
    TPropertiesService extends _IPropertiesService<TProperties, TCommon>,
    TComponentSelectorType extends string,
    TContainerType extends string = string,
> extends _AgTabGuardComp<
    TBeanCollection,
    TProperties,
    TGlobalEvents,
    TCommon,
    TPropertiesService,
    TComponentSelectorType
> {
    private readonly eHeader: HTMLElement = RefPlaceholder;
    private readonly eBody: HTMLElement = RefPlaceholder;

    private eTabHeader!: HTMLElement;
    private eCloseButton?: HTMLElement;

    private readonly params: AgTabbedLayoutParams<TContainerType>;
    private afterAttachedParams: _AfterGuiAttachedParams<TContainerType>;
    private readonly items: TabbedItemWrapper<TContainerType>[] = [];
    private activeItem: TabbedItemWrapper<TContainerType>;
    private lastScrollListener: (() => null) | null | undefined;
    private readonly tabbedItemScrollMap = new Map<string, number>();

    constructor(params: AgTabbedLayoutParams<TContainerType>) {
        super(getTabbedLayoutTemplate(params.cssClass));
        this.params = params;
    }

    public postConstruct() {
        this.setupHeader();

        if (this.params.items) {
            for (const item of this.params.items) {
                this.addItem(item);
            }
        }

        this.initialiseTabGuard({
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            focusInnerElement: this.focusInnerElement.bind(this),
            focusTrapActive: true,
        });

        this.addDestroyFunc(() => this.activeItem?.tabbedItem?.afterDetachedCallback?.());
    }

    private setupHeader(): void {
        const { enableCloseButton, cssClass } = this.params;
        const addCssClasses = (el: HTMLElement, suffix: string) => {
            el.classList.add(`ag-tabs-${suffix}`);
            if (cssClass) {
                el.classList.add(`${cssClass}-${suffix}`);
            }
        };
        if (enableCloseButton) {
            this.setupCloseButton(addCssClasses);
            this.eTabHeader = _createAgElement({ tag: 'div', role: 'presentation' });
            addCssClasses(this.eHeader, 'header-wrapper');
            this.eHeader.appendChild(this.eTabHeader);
        } else {
            this.eTabHeader = this.eHeader;
        }
        _setAriaRole(this.eTabHeader, 'tablist');
        addCssClasses(this.eTabHeader, 'header');
    }

    private setupCloseButton(addCssClasses: (el: HTMLElement, suffix: string) => void): void {
        const eCloseButton = _createAgElement({ tag: 'button' });
        addCssClasses(eCloseButton, 'close-button');
        const eIcon = this.beans.iconSvc.createIconNoSpan('close')!;
        _setAriaLabel(eCloseButton, this.params.closeButtonAriaLabel);
        eCloseButton.appendChild(eIcon);
        this.addManagedElementListeners(eCloseButton, { click: () => this.params.onCloseClicked?.() });
        const eCloseButtonWrapper = _createAgElement({ tag: 'div', role: 'presentation' });
        addCssClasses(eCloseButtonWrapper, 'close-button-wrapper');
        eCloseButtonWrapper.appendChild(eCloseButton);
        this.eHeader.appendChild(eCloseButtonWrapper);
        this.eCloseButton = eCloseButton;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.RIGHT:
            case KeyCode.LEFT: {
                if (!this.eTabHeader.contains(_getActiveDomElement(this.beans))) {
                    return;
                }
                const isRightKey = e.key === KeyCode.RIGHT;
                const isRtl = this.gos.get('enableRtl');
                const currentPosition = this.items.indexOf(this.activeItem);
                const nextPosition =
                    isRightKey !== isRtl
                        ? Math.min(currentPosition + 1, this.items.length - 1)
                        : Math.max(currentPosition - 1, 0);

                if (currentPosition === nextPosition) {
                    return;
                }

                e.preventDefault();

                const nextItem = this.items[nextPosition];

                this.showItemWrapper(nextItem);
                nextItem.eHeaderButton.focus();
                break;
            }
            case KeyCode.UP:
            case KeyCode.DOWN:
                e.stopPropagation();
                break;
        }
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) {
            return;
        }

        const { beans, eHeader, eBody, activeItem, params } = this;
        const { suppressTrapFocus, enableCloseButton } = params;

        const activeElement = _getActiveDomElement(beans);
        const target = e.target as HTMLElement;
        const backwards = e.shiftKey;

        if (eHeader.contains(activeElement)) {
            e.preventDefault();
            if (enableCloseButton && backwards && !this.eCloseButton?.contains(activeElement)) {
                this.eCloseButton?.focus();
            } else if (suppressTrapFocus && backwards) {
                findFocusableElementBeforeTabGuard(_getDocument(beans).body, target)?.focus();
            } else {
                // focus is in header, move into body of popup
                this.focusBody(e.shiftKey);
            }
            return;
        }

        let nextEl: HTMLElement | null = null;

        if (isTargetUnderManagedComponent(eBody, target)) {
            if (backwards) {
                nextEl = findFocusableElementBeforeTabGuard(eBody, target);
            }

            if (!nextEl && !suppressTrapFocus) {
                nextEl = activeItem.eHeaderButton;
            }
        }

        if (!nextEl && eBody.contains(activeElement)) {
            nextEl = _findNextFocusableElement(beans, eBody, false, backwards);

            if (!nextEl) {
                if (suppressTrapFocus && !backwards) {
                    this.forceFocusOutOfContainer(backwards);
                } else if (enableCloseButton && !backwards) {
                    e.preventDefault();
                    this.eCloseButton?.focus();
                } else {
                    e.preventDefault();
                    this.focusHeader();
                }
                return;
            }
        }

        if (nextEl) {
            e.preventDefault();
            nextEl.focus();
        }
    }

    private focusInnerElement(fromBottom?: boolean): boolean {
        if (fromBottom) {
            return this.focusBody(true);
        } else {
            this.focusHeader();
            return true;
        }
    }

    public focusHeader(preventScroll?: boolean): void {
        this.activeItem.eHeaderButton.focus({ preventScroll });
    }

    private focusBody(fromBottom?: boolean): boolean {
        return _focusInto(this.eBody, fromBottom);
    }

    public setAfterAttachedParams(params: _AfterGuiAttachedParams<TContainerType>): void {
        this.afterAttachedParams = params;
    }

    public showFirstItem(): void {
        if (this.items.length > 0) {
            this.showItemWrapper(this.items[0]);
        }
    }

    private addItem(item: AgTabbedItem<TContainerType>): void {
        const eHeaderButton = _createAgElement({
            tag: 'span',
            cls: 'ag-tab',
            role: 'tab',
            attrs: { tabindex: '-1' },
        });
        eHeaderButton.appendChild(item.title);

        this.eTabHeader.appendChild(eHeaderButton);
        _setAriaLabel(eHeaderButton, item.titleLabel);

        const wrapper: TabbedItemWrapper<TContainerType> = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton,
        };
        this.items.push(wrapper);

        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    }

    public showItem(tabbedItem: AgTabbedItem<TContainerType>): void {
        const itemWrapper = this.items.find((wrapper) => wrapper.tabbedItem === tabbedItem);

        if (itemWrapper) {
            this.showItemWrapper(itemWrapper);
        }
    }

    private showItemWrapper(wrapper: TabbedItemWrapper<TContainerType>): void {
        const { tabbedItem, eHeaderButton } = wrapper;

        this.params.onItemClicked?.({ item: tabbedItem });

        if (this.activeItem === wrapper) {
            this.params.onActiveItemClicked?.();
            return;
        }

        if (this.lastScrollListener) {
            this.lastScrollListener = this.lastScrollListener();
        }

        _clearElement(this.eBody);

        tabbedItem.bodyPromise.then((body: HTMLElement) => {
            this.eBody.appendChild(body);
            const onlyUnmanaged = !_isKeyboardMode();

            if (!this.params.suppressFocusBodyOnOpen) {
                _focusInto(this.eBody, false, onlyUnmanaged);
            }

            if (tabbedItem.afterAttachedCallback) {
                tabbedItem.afterAttachedCallback(this.afterAttachedParams);
            }

            if (this.params.keepScrollPosition) {
                const scrollableContainer = tabbedItem.getScrollableContainer?.() || body;
                [this.lastScrollListener] = this.addManagedElementListeners(scrollableContainer, {
                    scroll: () => {
                        this.tabbedItemScrollMap.set(tabbedItem.name, scrollableContainer.scrollTop);
                    },
                });
                const scrollPosition = this.tabbedItemScrollMap.get(tabbedItem.name);
                if (scrollPosition !== undefined) {
                    // Safari needs a small timeout or it will fire a scroll event to position 0
                    setTimeout(() => {
                        scrollableContainer.scrollTop = scrollPosition;
                    }, 0);
                }
            }
        });

        if (this.activeItem) {
            this.activeItem.eHeaderButton.classList.remove('ag-tab-selected');
            this.activeItem.tabbedItem.afterDetachedCallback?.();
        }

        eHeaderButton.classList.add('ag-tab-selected');

        this.activeItem = wrapper;
    }
}
