import { Promise, _ } from '../utils';
import { Component } from '../widgets/component';
import { RefSelector } from '../widgets/componentAnnotations';
import { PostConstruct, Autowired } from '../context/context';
import { Constants } from '../constants';
import { FocusController } from '../focusController';

export class TabbedLayout extends Component {

    @Autowired('focusController') private focusController: FocusController;

    @RefSelector('eHeader') private eHeader: HTMLElement;
    @RefSelector('eBody') private eBody: HTMLElement;

    private params: TabbedLayoutParams;
    private afterAttachedParams: any;
    private items: TabbedItemWrapper[] = [];
    private activeItem: TabbedItemWrapper;
    protected managedTab = true;

    constructor(params: TabbedLayoutParams) {
        super(TabbedLayout.getTemplate(params.cssClass));
        this.params = params;

        if (params.items) {
            params.items.forEach(item => this.addItem(item));
        }
    }

    @PostConstruct
    public init(): void {
        this.addDestroyableEventListener(this.getGui(), 'keydown', this.handleKeyDown.bind(this));
    }

    private handleKeyDown(e: KeyboardEvent): void {
        switch (e.keyCode) {
            case Constants.KEY_RIGHT:
            case Constants.KEY_LEFT:
                if (!this.eHeader.contains(document.activeElement)) { return; }
                const currentPosition = this.items.indexOf(this.activeItem);
                const nextPosition = e.keyCode === Constants.KEY_RIGHT ? Math.min(currentPosition + 1, this.items.length - 1) : Math.max(currentPosition - 1, 0);

                if (currentPosition === nextPosition) { return; }
                const nextItem = this.items[nextPosition];

                this.showItemWrapper(nextItem);
                nextItem.eHeaderButton.focus();
            case Constants.KEY_UP:
            case Constants.KEY_DOWN:
                e.preventDefault();
                break;
        }
    }

    protected onTabKeyDown(e: KeyboardEvent) {
        super.onTabKeyDown(e);

        const focusableItems = this.focusController.findFocusableElements(this.eBody, '.ag-set-filter-list *, .ag-menu-list *');
        const activeElement = document.activeElement as HTMLElement;

        if (this.eHeader.contains(activeElement)) {
            if (focusableItems.length) {
                focusableItems[e.shiftKey ? focusableItems.length - 1 : 0].focus();
            }
        } else {
            const focusedPosition = focusableItems.indexOf(activeElement);
            const nextPosition = e.shiftKey ? focusedPosition - 1 : focusedPosition + 1;

            if (nextPosition < 0 || nextPosition >= focusableItems.length) {
                this.activeItem.eHeaderButton.focus();
                return;
            }

            const nextItem = focusableItems[nextPosition];

            if (nextItem) { nextItem.focus(); }
        }
    }

    private static getTemplate(cssClass?: string) {
        return `<div class="ag-tabs ${cssClass}">
            <div ref="eHeader" class="ag-tabs-header ${cssClass ? `${cssClass}-header` : ''}"></div>
            <div ref="eBody" class="ag-tabs-body ${cssClass ? `${cssClass}-body` : ''}"></div>
        </div>`;
    }

    public setAfterAttachedParams(params: any): void {
        this.afterAttachedParams = params;
    }

    public getMinDimensions(): {width: number, height: number} {
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
            _.clearElement(eDummyBody);

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
        eHeaderButton.tabIndex = -1;
        eHeaderButton.appendChild(item.title);
        _.addCssClass(eHeaderButton, 'ag-tab');
        this.eHeader.appendChild(eHeaderButton);

        const wrapper: TabbedItemWrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);

        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    }

    public showItem(tabbedItem: TabbedItem): void {
        const itemWrapper = _.find(this.items, wrapper => {
            return wrapper.tabbedItem === tabbedItem;
        });
        if (itemWrapper) {
            this.showItemWrapper(itemWrapper);
        }
    }

    private showItemWrapper(wrapper: TabbedItemWrapper): void {
        if (this.params.onItemClicked) {
            this.params.onItemClicked({item: wrapper.tabbedItem});
        }

        if (this.activeItem === wrapper) {
            _.callIfPresent(this.params.onActiveItemClicked);
            return;
        }

        _.clearElement(this.eBody);
        wrapper.tabbedItem.bodyPromise.then(body => {
            this.eBody.appendChild(body);
            body.focus();
        });

        if (this.activeItem) {
            _.removeCssClass(this.activeItem.eHeaderButton, 'ag-tab-selected');
        }
        _.addCssClass(wrapper.eHeaderButton, 'ag-tab-selected');

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
    bodyPromise: Promise<HTMLElement>;
    name: string;
    afterAttachedCallback?: Function;
}

interface TabbedItemWrapper {
    tabbedItem: TabbedItem;
    eHeaderButton: HTMLElement;
}