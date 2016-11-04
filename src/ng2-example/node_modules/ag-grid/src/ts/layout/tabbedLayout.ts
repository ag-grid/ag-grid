import {Utils as _} from '../utils';

export class TabbedLayout {

    private eGui: HTMLElement;
    private eHeader: HTMLElement;
    private eBody: HTMLElement;
    private params: TabbedLayoutParams;

    private afterAttachedParams: any;

    private static TEMPLATE =
        '<div>'+
            '<div id="tabHeader" class="ag-tab-header"></div>'+
            '<div id="tabBody" class="ag-tab-body"></div>'+
        '</div>';

    private items: TabbedItemWrapper[] = [];
    private activeItem: TabbedItemWrapper;

    constructor(params: TabbedLayoutParams) {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = TabbedLayout.TEMPLATE;

        this.eHeader = <HTMLElement> this.eGui.querySelector('#tabHeader');
        this.eBody = <HTMLElement> this.eGui.querySelector('#tabBody');

        _.addCssClass(this.eGui, params.cssClass);

        if (params.items) {
            params.items.forEach( item => this.addItem(item) );
        }
    }

    public setAfterAttachedParams(params: any): void {
        this.afterAttachedParams = params;
    }

    public getMinWidth(): number {
        var eDummyContainer = document.createElement('span');
        // position fixed, so it isn't restricted to the boundaries of the parent
        eDummyContainer.style.position = 'fixed';

        // we put the dummy into the body container, so it will inherit all the
        // css styles that the real cells are inheriting
        this.eGui.appendChild(eDummyContainer);

        var minWidth = 0;

        this.items.forEach( (itemWrapper: TabbedItemWrapper) => {
            _.removeAllChildren(eDummyContainer);

            var eClone: HTMLElement = <HTMLElement> itemWrapper.tabbedItem.body.cloneNode(true);
            eDummyContainer.appendChild(eClone);

            if (minWidth<eDummyContainer.offsetWidth) {
                minWidth = eDummyContainer.offsetWidth;
            }
        });

        this.eGui.removeChild(eDummyContainer);

        return minWidth;
    }

    public showFirstItem(): void {
        if (this.items.length>0) {
            this.showItemWrapper(this.items[0]);
        }
    }

    private addItem(item: TabbedItem): void {

        var eHeaderButton = document.createElement('span');
        eHeaderButton.appendChild(item.title);
        _.addCssClass(eHeaderButton, 'ag-tab');
        this.eHeader.appendChild(eHeaderButton);

        var wrapper: TabbedItemWrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);

        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
    }

    public showItem(tabbedItem: TabbedItem): void {
        var itemWrapper = _.find(this.items, (itemWrapper)=> {
            return itemWrapper.tabbedItem === tabbedItem;
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
        _.removeAllChildren(this.eBody);
        this.eBody.appendChild(wrapper.tabbedItem.body);

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
    items: TabbedItem[],
    cssClass?: string,
    onItemClicked?: Function
    onActiveItemClicked?: Function
}

export interface TabbedItem {
    title: Element,
    body: HTMLElement,
    afterAttachedCallback?: Function
}

interface TabbedItemWrapper {
    tabbedItem: TabbedItem,
    eHeaderButton: HTMLElement
}