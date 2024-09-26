import type { IHeaderComp, IHeaderParams } from 'ag-grid-community';

export class CustomHeader implements IHeaderComp {
    params!: IHeaderParams;
    eGui!: HTMLDivElement;
    eFilterMenu: any;
    eText: any;
    filterMenuPresent!: boolean;
    onMenuClickListener: any;

    init(params: IHeaderParams) {
        this.params = params;
        console.log('CustomHeader.init() -> ' + this.params.column.getId());
        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '' +
            '<div style="display: flex;">' +
            '<span data-ref="eFilterMenu" class="ag-icon ag-icon-menu" style="margin-right: 4px;"></span>' +
            '<div style="flex-grow: 1;">' +
            '<span data-ref="eText" style=""></span>' +
            '</div>' +
            '</div>';

        this.eFilterMenu = this.eGui.querySelector('[data-ref="eFilterMenu"]');
        this.eText = this.eGui.querySelector('[data-ref="eText"]');

        this.filterMenuPresent = this.params.enableFilterButton;

        if (this.filterMenuPresent) {
            this.onMenuClickListener = this.onMenuClick.bind(this);
            this.eFilterMenu.addEventListener('click', this.onMenuClickListener);
        } else {
            this.eFilterMenu.parentNode.removeChild(this.eFilterMenu);
        }

        this.updateHeaderNameText();
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: IHeaderParams) {
        this.params = params;

        const res = this.params.enableFilterButton === this.filterMenuPresent;

        console.log('CustomHeader.refresh() -> ' + this.params.column.getId() + ' returning ' + res);

        this.updateHeaderNameText();

        return res;
    }

    updateHeaderNameText() {
        this.eText.textContent = this.params.displayName;
    }

    onMenuClick() {
        this.params.showColumnMenu(this.eFilterMenu);
    }

    destroy() {
        console.log('CustomHeader.destroy() -> ' + this.params.column.getId());
        if (this.onMenuClickListener) {
            this.eFilterMenu.removeEventListener('click', this.onMenuClickListener);
        }
    }
}
