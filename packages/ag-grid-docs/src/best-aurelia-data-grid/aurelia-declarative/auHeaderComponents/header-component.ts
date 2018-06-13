import {bindable, customElement, inject} from "aurelia-framework";

@customElement('ag-header-component')
@inject(Element)
export class HeaderComponent {
    params: any;

    @bindable() sorted: string;
    @bindable() menuIcon: string;

    element: any;

    constructor(element) {
        this.element = element;

        this.onSortChanged = this.onSortChanged.bind(this);
    }


    attached(): void {
        this.menuIcon = 'fa ' + this.params.menuIcon;
        this.params.column.addEventListener('sortChanged', this.onSortChanged);
        this.onSortChanged();
    }

    detached() {
        this.params.column.addEventListener('sortChanged', this.onSortChanged);
    }

    onSortChanged() {
        if (this.params.column.isSortAscending()) {
            this.sorted = 'asc'
        } else if (this.params.column.isSortDescending()) {
            this.sorted = 'desc'
        } else {
            this.sorted = ''
        }
    };

    onMenuClick() {
        this.params.showColumnMenu(this.querySelector('.customHeaderMenuButton'));
    }

    private querySelector(selector: string) {
        return <HTMLElement>this.element.querySelector('.customHeaderMenuButton', selector);
    }

    onSortRequested(order, event) {
        this.params.setSort(order, event.shiftKey);
    };
}
