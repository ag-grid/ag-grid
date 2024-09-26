import type { IHeaderParams } from 'ag-grid-community';

export interface ICustomHeaderParams {
    menuIcon: string;
}

export class CustomHeader {
    private agParams!: ICustomHeaderParams & IHeaderParams;
    private eGui!: HTMLDivElement;
    eMenuButton: any;
    eSortDownButton: any;
    eSortUpButton: any;
    eSortRemoveButton: any;
    onMenuClickListener!: () => void;
    onSortAscRequestedListener!: (event: any) => void;
    onSortDescRequestedListener!: (event: any) => void;
    onRemoveSortListener!: (event: any) => void;
    onSortChangedListener!: () => void;

    init(agParams: ICustomHeaderParams & IHeaderParams) {
        this.agParams = agParams;
        const div = document.createElement('div');
        div.className = 'headerWrapper';
        div.innerHTML = `
            <div class="customHeaderMenuButton">
                <i class="fa ${agParams.menuIcon}"></i>
            </div>
            <div class="customHeaderLabel">${agParams.displayName}</div>
            <div class="customSortDownLabel inactive">
                <i class="fa fa-long-arrow-alt-down"></i>
            </div>
            <div class="customSortUpLabel inactive">
                <i class="fa fa-long-arrow-alt-up"></i>
            </div>
            <div class="customSortRemoveLabel inactive">
                <i class="fa fa-times"></i>
            </div>
        `;

        this.eMenuButton = div.querySelector('.customHeaderMenuButton');
        this.eSortDownButton = div.querySelector('.customSortDownLabel');
        this.eSortUpButton = div.querySelector('.customSortUpLabel');
        this.eSortRemoveButton = div.querySelector('.customSortRemoveLabel');

        if (agParams.enableFilterButton) {
            this.onMenuClickListener = this.onMenuClick.bind(this);
            this.eMenuButton.addEventListener('click', this.onMenuClickListener);
        } else {
            div.removeChild(this.eMenuButton);
        }

        if (agParams.enableSorting) {
            this.onSortAscRequestedListener = this.onSortRequested.bind(this, 'asc');
            this.eSortDownButton.addEventListener('click', this.onSortAscRequestedListener);
            this.onSortDescRequestedListener = this.onSortRequested.bind(this, 'desc');
            this.eSortUpButton.addEventListener('click', this.onSortDescRequestedListener);
            this.onRemoveSortListener = this.onSortRequested.bind(this, null);
            this.eSortRemoveButton.addEventListener('click', this.onRemoveSortListener);

            this.onSortChangedListener = this.onSortChanged.bind(this);
            agParams.column.addEventListener('sortChanged', this.onSortChangedListener);
            this.onSortChanged();
        } else {
            div.removeChild(this.eSortDownButton);
            div.removeChild(this.eSortUpButton);
            div.removeChild(this.eSortRemoveButton);
        }

        this.eGui = div;

        const customHeaderLabel = div.querySelector('.customHeaderLabel');
        agParams.setTooltip(
            agParams.displayName,
            () => customHeaderLabel!.scrollWidth > customHeaderLabel!.clientWidth
        );
    }

    onSortChanged() {
        const deactivate = (toDeactivateItems: any[]) => {
            toDeactivateItems.forEach((toDeactivate) => {
                toDeactivate.className = toDeactivate.className.split(' ')[0];
            });
        };

        const activate = (toActivate: any) => {
            toActivate.className = toActivate.className + ' active';
        };
        const sort = this.agParams.column.getSort();
        if (sort === 'asc') {
            deactivate([this.eSortUpButton, this.eSortRemoveButton]);
            activate(this.eSortDownButton);
        } else if (sort === 'desc') {
            deactivate([this.eSortDownButton, this.eSortRemoveButton]);
            activate(this.eSortUpButton);
        } else {
            deactivate([this.eSortUpButton, this.eSortDownButton]);
            activate(this.eSortRemoveButton);
        }
    }

    getGui() {
        return this.eGui;
    }

    onMenuClick() {
        this.agParams.showColumnMenu(this.eMenuButton);
    }

    onSortRequested(order: 'asc' | 'desc' | null, event: any) {
        this.agParams.setSort(order, event.shiftKey);
    }

    destroy() {
        if (this.onMenuClickListener) {
            this.eMenuButton.removeEventListener('click', this.onMenuClickListener);
        }
        this.eSortDownButton.removeEventListener('click', this.onSortAscRequestedListener);
        this.eSortUpButton.removeEventListener('click', this.onSortDescRequestedListener);
        this.eSortRemoveButton.removeEventListener('click', this.onRemoveSortListener);
        this.agParams.column.removeEventListener('sortChanged', this.onSortChangedListener);
    }
}
