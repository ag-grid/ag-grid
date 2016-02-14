import _ from '../utils';

export class TabbedLayout {

    private eGui: HTMLElement;
    private eHeader: HTMLElement;
    private eBody: HTMLElement;

    private static TEMPLATE =
        '<div>'+
            '<div id="tabHeader" class="ag-tab-header"></div>'+
            '<div id="tabBody" class="ag-tab-body"></div>'+
        '</div>';

    private items: TabbedItemWrapper[] = [];
    private activeItem: TabbedItemWrapper;

    constructor(params: TabbedLayoutParams) {
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = TabbedLayout.TEMPLATE;

        this.eHeader = <HTMLElement> this.eGui.querySelector('#tabHeader');
        this.eBody = <HTMLElement> this.eGui.querySelector('#tabBody');

        _.addCssClass(this.eGui, params.cssClass);

        if (params.items) {
            params.items.forEach( item => this.addItem(item) );
        }
    }

    public showFirstItem(): void {
        if (this.items.length>0) {
            this.showItem(this.items[0]);
        }
    }

    private addItem(item: TabbedItem): void {

        var eHeaderButton = document.createElement('span');
        eHeaderButton.innerHTML = item.title;
        _.addCssClass(eHeaderButton, 'ag-tab');
        this.eHeader.appendChild(eHeaderButton);

        var wrapper: TabbedItemWrapper = {
            tabbedItem: item,
            eHeaderButton: eHeaderButton
        };
        this.items.push(wrapper);

        eHeaderButton.addEventListener('click', this.showItem.bind(this, wrapper));
    }

    private showItem(wrapper: TabbedItemWrapper): void {
        if (this.activeItem === wrapper) {
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
            wrapper.tabbedItem.afterAttachedCallback();
        }
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

}

export interface TabbedLayoutParams {
    items: TabbedItem[],
    cssClass?: string
}

export interface TabbedItem {
    title: string,
    body: HTMLElement,
    afterAttachedCallback?: Function
}

interface TabbedItemWrapper {
    tabbedItem: TabbedItem,
    eHeaderButton: HTMLElement
}