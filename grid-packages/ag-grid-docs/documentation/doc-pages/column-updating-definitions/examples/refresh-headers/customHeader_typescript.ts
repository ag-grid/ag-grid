import { IHeaderComp, IHeaderParams } from "@ag-grid-community/core";

export class CustomHeader implements IHeaderComp {
    params!: IHeaderParams;
    eGui!: HTMLDivElement;
    eMenu: any;
    eText: any;
    menuPresent!: boolean;
    onMenuClickListener: any;

    init(params: IHeaderParams) {
        this.params = params;
        console.log('CustomHeader.init() -> ' + this.params.column.getId());
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = '' +
            '<div style="display: flex;">' +
            '<span ref="eMenu" class="ag-icon ag-icon-menu" style="margin-right: 4px;"></span>' +
            '<div style="flex-grow: 1;">' +
            '<span ref="eText" style=""></span>' +
            '</div>' +
            '</div>';

        this.eMenu = this.eGui.querySelector('[ref="eMenu"]');
        this.eText = this.eGui.querySelector('[ref="eText"]');

        this.menuPresent = this.params.enableMenu;

        if (this.menuPresent) {
            this.onMenuClickListener = this.onMenuClick.bind(this);
            this.eMenu.addEventListener('click', this.onMenuClickListener);
        } else {
            this.eMenu.parentNode.removeChild(this.eMenu);
        }

        this.updateHeaderNameText();
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: IHeaderParams) {
        this.params = params;

        var res = this.params.enableMenu === this.menuPresent;

        console.log('CustomHeader.refresh() -> ' + this.params.column.getId() + ' returning ' + res);

        this.updateHeaderNameText();

        return res;
    }

    updateHeaderNameText() {
        this.eText.innerHTML = this.params.displayName;
    }

    onMenuClick() {
        this.params.showColumnMenu(this.eMenu);
    }

    destroy() {
        console.log('CustomHeader.destroy() -> ' + this.params.column.getId());
        if (this.onMenuClickListener) {
            this.eMenu.removeEventListener('click', this.onMenuClickListener);
        }
    }
}