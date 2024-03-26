import { AgPromise } from '../utils';
import { RefSelector } from '../widgets/componentAnnotations';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { clearElement } from '../utils/dom';
import { setAriaLabel, setAriaRole } from '../utils/aria';
import { KeyCode } from '../constants/keyCode';
import { PostConstruct, Autowired } from '../context/context';
import { FocusService } from '../focusService';
import { TabGuardComp } from '../widgets/tabGuardComp';
import { createIconNoSpan } from '../utils/icon';

export class TabbedLayout extends TabGuardComp {

    @Autowired('focusService') private focusService: FocusService;

    @RefSelector('eHeader') private readonly eHeader: HTMLElement;
    @RefSelector('eBody') private readonly eBody: HTMLElement;

    private eTabHeader: HTMLElement;
    private eCloseButton?: HTMLElement;

    private params: TabbedLayoutParams;
    private afterAttachedParams: IAfterGuiAttachedParams;
    private items: TabbedItemWrapper[] = [];
    private activeItem: TabbedItemWrapper;
    private lastScrollListener: (() => null) | null | undefined;
    private readonly tabbedItemScrollMap = new Map<string, number>();

    constructor(params: TabbedLayoutParams) {
        super(TabbedLayout.getTemplate(params.cssClass));
        this.params = params;
    }

    @PostConstruct
    private postConstruct() {
        this.setupHeader();

        if (this.params.items) {
            this.params.items.forEach(item => this.addItem(item));
        }

        this.initialiseTabGuard({
            onTabKeyDown: this.onTabKeyDown.bind(this),
            handleKeyDown: this.handleKeyDown.bind(this),
            focusInnerElement: this.focusInnerElement.bind(this),
            focusTrapActive: true
        });

        this.addDestroyFunc(() => this.activeItem?.tabbedItem?.afterDetachedCallback?.());
    }

    private static getTemplate(cssClass?: string) {
        return /* html */ `<div class="ag-tabs ${cssClass}">
            <div ref="eHeader"></div>
            <div ref="eBody" role="presentation" class="ag-tabs-body ${cssClass ? `${cssClass}-body` : ''}"></div>
        </div>`;
    }

    private setupHeader(): void {
        const { enableCloseButton, cssClass } = this.params;
        const addCssClasses = (el: HTMLElement, suffix: string) => {
            el.classList.add(`ag-tabs-${suffix}`);
            if (cssClass) {
                el.classList.add(`${cssClass}-${suffix}`);
            }
        }
        if (enableCloseButton) {
            this.setupCloseButton(addCssClasses);
            this.eTabHeader = this.gos.getDocument().createElement('div');
            addCssClasses(this.eHeader, 'header-wrapper');
            setAriaRole(this.eHeader, 'presentation');
            this.eHeader.appendChild(this.eTabHeader);
        } else {
            this.eTabHeader = this.eHeader;
        }
        setAriaRole(this.eTabHeader, 'tablist');
        addCssClasses(this.eTabHeader, 'header');
    }

    private setupCloseButton(addCssClasses: (el: HTMLElement, suffix: string) => void): void {
        const eDocument = this.gos.getDocument();
        const eCloseButton = eDocument.createElement('button');
        addCssClasses(eCloseButton, 'close-button');
        const eIcon = createIconNoSpan(
            'close',
            this.gos,
            undefined,
            true
        )!;
        setAriaLabel(eCloseButton, this.params.closeButtonAriaLabel);
        eCloseButton.appendChild(eIcon);
        this.addManagedListener(eCloseButton, 'click', () => this.params.onCloseClicked?.());
        const eCloseButtonWrapper = eDocument.createElement('div');
        addCssClasses(eCloseButtonWrapper, 'close-button-wrapper');
        setAriaRole(eCloseButtonWrapper, 'presentation');
        eCloseButtonWrapper.appendChild(eCloseButton);
        this.eHeader.appendChild(eCloseButtonWrapper);
        this.eCloseButton = eCloseButton;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case KeyCode.RIGHT:
            case KeyCode.LEFT:
                if (!this.eTabHeader.contains(this.gos.getActiveDomElement())) { return; }
                const isRightKey = e.key === KeyCode.RIGHT;
                const isRtl = this.gos.get('enableRtl');
                const currentPosition = this.items.indexOf(this.activeItem);
                const nextPosition = isRightKey !== isRtl ? Math.min(currentPosition + 1, this.items.length - 1) : Math.max(currentPosition - 1, 0);

                if (currentPosition === nextPosition) { return; }

                e.preventDefault();

                const nextItem = this.items[nextPosition];

                this.showItemWrapper(nextItem);
                nextItem.eHeaderButton.focus();
                break;
            case KeyCode.UP:
            case KeyCode.DOWN:
                e.stopPropagation();
                break;
        }
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        if (e.defaultPrevented) { return; }

        const { focusService, eHeader, eBody, activeItem, params } = this;
        const { suppressTrapFocus, enableCloseButton } = params;

        const activeElement = this.gos.getActiveDomElement();
        const target = e.target as HTMLElement;
        const backwards = e.shiftKey;

        if (eHeader.contains(activeElement)) {
            e.preventDefault();
            if (enableCloseButton && backwards && !this.eCloseButton?.contains(activeElement)) {
                this.eCloseButton?.focus();
            } else if (suppressTrapFocus && backwards) {
                this.focusService.findFocusableElementBeforeTabGuard(this.gos.getDocument().body, target)?.focus();
            } else {
                // focus is in header, move into body of popup
                this.focusBody(e.shiftKey);
            }
            return;
        }

        let nextEl: HTMLElement | null = null;

        if (focusService.isTargetUnderManagedComponent(eBody, target)) {
            if (backwards) {
                nextEl = this.focusService.findFocusableElementBeforeTabGuard(eBody, target);
            }

            if (!nextEl && !suppressTrapFocus) {
                nextEl = activeItem.eHeaderButton;
            }
        }

        if (!nextEl && eBody.contains(activeElement)) {
            nextEl = focusService.findNextFocusableElement(eBody, false, backwards);

            if (!nextEl) {
                e.preventDefault();
                if (suppressTrapFocus && !backwards) {
                    this.forceFocusOutOfContainer(backwards);
                } else if (enableCloseButton && !backwards) {
                    this.eCloseButton?.focus();
                } else {
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

    private focusInnerElement(fromBottom?: boolean): void {
        if (fromBottom) {
            this.focusHeader();
        } else {
            this.focusBody(true);
        }
    }

    public focusHeader(preventScroll?: boolean): void {
        this.activeItem.eHeaderButton.focus({ preventScroll });
    }

    private focusBody(fromBottom?: boolean): void {
        this.focusService.focusInto(this.eBody, fromBottom);
    }

    public setAfterAttachedParams(params: IAfterGuiAttachedParams): void {
        this.afterAttachedParams = params;
    }

    public showFirstItem(): void {
        if (this.items.length > 0) {
            this.showItemWrapper(this.items[0]);
        }
    }

    private addItem(item: TabbedItem): void {
        const eHeaderButton = document.createElement('span');

        setAriaRole(eHeaderButton, 'tab');
        eHeaderButton.setAttribute('tabindex', '-1');
        eHeaderButton.appendChild(item.title);
        eHeaderButton.classList.add('ag-tab');

        this.eTabHeader.appendChild(eHeaderButton);
        setAriaLabel(eHeaderButton, item.titleLabel);

        const wrapper: TabbedItemWrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);

        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    }

    public showItem(tabbedItem: TabbedItem): void {
        const itemWrapper = this.items.find(wrapper => wrapper.tabbedItem === tabbedItem);

        if (itemWrapper) {
            this.showItemWrapper(itemWrapper);
        }
    }

    private showItemWrapper(wrapper: TabbedItemWrapper): void {
        const { tabbedItem, eHeaderButton } = wrapper;

        this.params.onItemClicked?.({ item: tabbedItem });

        if (this.activeItem === wrapper) {
            this.params.onActiveItemClicked?.()
            return;
        }

        if (this.lastScrollListener) {
            this.lastScrollListener = this.lastScrollListener();
        }

        clearElement(this.eBody);

        tabbedItem.bodyPromise.then((body: HTMLElement) => {
            this.eBody.appendChild(body);
            const onlyUnmanaged = !this.focusService.isKeyboardMode();

            if (!this.params.suppressFocusBodyOnOpen) {
                this.focusService.focusInto(this.eBody, false, onlyUnmanaged);
            }

            if (tabbedItem.afterAttachedCallback) {
                tabbedItem.afterAttachedCallback(this.afterAttachedParams);
            }

            if (this.params.keepScrollPosition) {
                const scrollableContainer = (tabbedItem.getScrollableContainer && tabbedItem.getScrollableContainer()) || body;
                this.lastScrollListener = this.addManagedListener(scrollableContainer, 'scroll', () => {
                    this.tabbedItemScrollMap.set(tabbedItem.name, scrollableContainer.scrollTop);
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

export interface TabbedLayoutParams {
    items: TabbedItem[];
    cssClass?: string;
    keepScrollPosition?: boolean;
    onItemClicked?: (event: { item: TabbedItem }) => void;
    onActiveItemClicked?: () => void;
    suppressFocusBodyOnOpen?: boolean;
    suppressTrapFocus?: boolean;
    enableCloseButton?: boolean;
    closeButtonAriaLabel?: string;
    onCloseClicked?: () => void;
}

export interface TabbedItem {
    title: Element;
    titleLabel: string;
    bodyPromise: AgPromise<HTMLElement>;
    name: string;
    getScrollableContainer?: () => HTMLElement;
    afterAttachedCallback?: (params: IAfterGuiAttachedParams) => void;
    afterDetachedCallback?: () => void;
}

interface TabbedItemWrapper {
    tabbedItem: TabbedItem;
    eHeaderButton: HTMLElement;
}
