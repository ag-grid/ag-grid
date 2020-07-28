import { Promise } from '../utils';
import { RefSelector } from '../widgets/componentAnnotations';
import { ManagedFocusComponent } from '../widgets/managedFocusComponent';
import { IAfterGuiAttachedParams } from '../interfaces/iAfterGuiAttachedParams';
import { addCssClass, clearElement, removeCssClass } from '../utils/dom';
import { setAriaLabel } from '../utils/aria';
import { find } from '../utils/generic';
import { callIfPresent } from '../utils/function';
import { KeyCode } from '../constants/keyCode';

export class TabbedLayout extends ManagedFocusComponent {

    @RefSelector('eHeader') private readonly eHeader: HTMLElement;
    @RefSelector('eBody') private readonly eBody: HTMLElement;

    private params: TabbedLayoutParams;
    private afterAttachedParams: IAfterGuiAttachedParams;
    private items: TabbedItemWrapper[] = [];
    private activeItem: TabbedItemWrapper;

    constructor(params: TabbedLayoutParams) {
        super(TabbedLayout.getTemplate(params.cssClass));
        this.params = params;

        if (params.items) {
            params.items.forEach(item => this.addItem(item));
        }
    }

    private static getTemplate(cssClass?: string) {
        return /* html */ `<div class="ag-tabs ${cssClass}">
            <div ref="eHeader" role="menu" class="ag-tabs-header ${cssClass ? `${cssClass}-header` : ''}"></div>
            <div ref="eBody" role="presentation" class="ag-tabs-body ${cssClass ? `${cssClass}-body` : ''}"></div>
        </div>`;
    }

    protected handleKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case KeyCode.RIGHT:
            case KeyCode.LEFT:
                if (!this.eHeader.contains(document.activeElement)) { return; }

                const currentPosition = this.items.indexOf(this.activeItem);
                const nextPosition = e.keyCode === KeyCode.RIGHT ? Math.min(currentPosition + 1, this.items.length - 1) : Math.max(currentPosition - 1, 0);

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

        const { focusController, eHeader, eBody, activeItem } = this;
        const activeElement = document.activeElement as HTMLElement;

        e.preventDefault();

        if (eHeader.contains(activeElement)) {
            // focus is in header, move into body of popup
            focusController.focusInto(eBody, e.shiftKey);
        } else {
            // focus is in body, establish if it should return to header
            if (focusController.isFocusUnderManagedComponent(eBody)) {
                // focus was in a managed focus component and has now left, so we can return to the header
                activeItem.eHeaderButton.focus();
            } else {
                const nextEl = focusController.findNextFocusableElement(eBody, false, e.shiftKey);

                if (nextEl) {
                    // if another element exists in the body that can be focussed, go to that
                    nextEl.focus();
                } else {
                    // otherwise return to the header
                    activeItem.eHeaderButton.focus();
                }
            }
        }
    }

    public setAfterAttachedParams(params: IAfterGuiAttachedParams): void {
        this.afterAttachedParams = params;
    }

    public getMinDimensions(): { width: number, height: number; } {
        const eDummyContainer = this.getGui().cloneNode(true) as HTMLElement;
        const eDummyBody = eDummyContainer.querySelector('[ref="eBody"]') as HTMLElement;

        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        this.getGui().appendChild(eDummyContainer);

        let minWidth = 0;
        let minHeight = 0;

        this.items.forEach((itemWrapper: TabbedItemWrapper) => {
            clearElement(eDummyBody);

            const eClone: HTMLElement = itemWrapper.tabbedItem.bodyPromise.resolveNow(null, body => body.cloneNode(true)) as HTMLElement;
            if (eClone == null) { return; }

            eDummyBody.appendChild(eClone);

            if (minWidth < eDummyContainer.offsetWidth) {
                minWidth = eDummyContainer.offsetWidth;
            }

            if (minHeight < eDummyContainer.offsetHeight) {
                minHeight = eDummyContainer.offsetHeight;
            }
        });

        this.getGui().removeChild(eDummyContainer);

        return { height: minHeight, width: minWidth };
    }

    public showFirstItem(): void {
        if (this.items.length > 0) {
            this.showItemWrapper(this.items[0]);
        }
    }

    private addItem(item: TabbedItem): void {
        const eHeaderButton = document.createElement('span');
        eHeaderButton.setAttribute('tabIndex', '-1');
        eHeaderButton.setAttribute('role', 'menuitem');
        eHeaderButton.appendChild(item.title);
        addCssClass(eHeaderButton, 'ag-tab');
        this.eHeader.appendChild(eHeaderButton);
        setAriaLabel(eHeaderButton, item.titleLabel);

        const wrapper: TabbedItemWrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);

        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    }

    public showItem(tabbedItem: TabbedItem): void {
        const itemWrapper = find(this.items, wrapper => {
            return wrapper.tabbedItem === tabbedItem;
        });
        if (itemWrapper) {
            this.showItemWrapper(itemWrapper);
        }
    }

    private showItemWrapper(wrapper: TabbedItemWrapper): void {
        if (this.params.onItemClicked) {
            this.params.onItemClicked({ item: wrapper.tabbedItem });
        }

        if (this.activeItem === wrapper) {
            callIfPresent(this.params.onActiveItemClicked);
            return;
        }

        clearElement(this.eBody);

        wrapper.tabbedItem.bodyPromise.then(body => {
            this.eBody.appendChild(body);
            const onlyUnmanaged = !this.focusController.isKeyboardFocus();

            this.focusController.focusInto(this.eBody, false, onlyUnmanaged);
        });

        if (this.activeItem) {
            removeCssClass(this.activeItem.eHeaderButton, 'ag-tab-selected');
        }

        addCssClass(wrapper.eHeaderButton, 'ag-tab-selected');

        this.activeItem = wrapper;

        if (wrapper.tabbedItem.afterAttachedCallback) {
            wrapper.tabbedItem.afterAttachedCallback(this.afterAttachedParams);
        }
    }
}

export interface TabbedLayoutParams {
    items: TabbedItem[];
    cssClass?: string;
    onItemClicked?: Function;
    onActiveItemClicked?: Function;
}

export interface TabbedItem {
    title: Element;
    titleLabel: string;
    bodyPromise: Promise<HTMLElement>;
    name: string;
    afterAttachedCallback?: (params: IAfterGuiAttachedParams) => void;
}

interface TabbedItemWrapper {
    tabbedItem: TabbedItem;
    eHeaderButton: HTMLElement;
}
