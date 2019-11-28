import { Promise, _ } from '../utils';

export class TabbedLayout {

    private eGui: HTMLElement;
    private eHeader: HTMLElement;
    private eBody: HTMLElement;
    private params: TabbedLayoutParams;

    private afterAttachedParams: any;

    private static TEMPLATE =
        '<div>' +
            '<div ref="tabHeader" class="ag-tab-header"></div>' +
            '<div ref="tabBody" class="ag-tab-body"></div>' +
        '</div>';

    private items: TabbedItemWrapper[] = [];
    private activeItem: TabbedItemWrapper;

    constructor(params: TabbedLayoutParams) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = TabbedLayout.TEMPLATE;

        this.eHeader = this.eGui.querySelector('[ref="tabHeader"]') as HTMLElement;
        this.eBody = this.eGui.querySelector('[ref="tabBody"]') as HTMLElement;

        _.addCssClass(this.eGui, params.cssClass);

        if (params.items) {
            params.items.forEach(item => this.addItem(item));
        }
    }

    public setAfterAttachedParams(params: any): void {
        this.afterAttachedParams = params;
    }

    public getMinDimensions(): {width: number, height: number} {

        const eDummyContainer = this.eGui.cloneNode(true) as HTMLElement;
        const eDummyBody = eDummyContainer.querySelector('[ref="tabBody"]') as HTMLElement;

        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        this.eGui.appendChild(eDummyContainer);

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

        // finally check the parent tabs are no wider, as if they
        // are, then these are the min width and not the child tabs
        // if (minWidth<this.eGui.offsetWidth) {
        //     minWidth = this.eGui.offsetWidth;
        // }

        this.eGui.removeChild(eDummyContainer);

        return {height: minHeight, width: minWidth};
    }

    public showFirstItem(): void {
        if (this.items.length > 0) {
            this.showItemWrapper(this.items[0]);
        }
    }

    private addItem(item: TabbedItem): void {

        const eHeaderButton = document.createElement('span');
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

    public getGui(): HTMLElement {
        return this.eGui;
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