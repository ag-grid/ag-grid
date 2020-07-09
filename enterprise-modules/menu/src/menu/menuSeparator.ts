import { _ } from '@ag-grid-community/core';

export class MenuSeparator {
    private readonly eGui: HTMLElement;

    constructor() {
        this.eGui = _.loadTemplate(/* html */`<div class="ag-menu-separator"></div>`);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }
}
