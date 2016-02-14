import Column from "../entities/column";
import _ from '../utils';
import {ColumnController} from "../columnController/columnController";

export class MenuPanel {

    private eGui: HTMLElement;
    private hideCallback: Function;

    constructor(options: MenuPanelItems[], hideCallback: Function) {
        this.hideCallback = hideCallback;

        this.eGui = document.createElement('div');
        _.addCssClass(this.eGui, 'ag-menu-panel');

        if (options) {
            options.forEach(this.addItem.bind(this));
        }

    }

    private addItem(option: MenuPanelItems): void {
        var eOption = _.loadTemplate(
            '<div class="ag-menu-option">' +
            '  <span id="menuOptionIcon" class="ag-menu-option-icon"></span>' +
            '  <span id="menuOptionText" class="ag-menu-option-text"></span>' +
            '</div>');
        var eIcon = <HTMLElement> eOption.querySelector('#menuOptionIcon');
        if (option.checked) {
            eIcon.innerHTML = '&#10004;';
        }

        var eText = <HTMLElement> eOption.querySelector('#menuOptionText');
        eText.innerHTML = option.name;

        eOption.addEventListener('click', this.onOptionSelected.bind(this, option));
        this.eGui.appendChild(eOption);
    }

    private onOptionSelected(option: MenuPanelItems): void {
        option.action();
        this.hideCallback();
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

}

export interface MenuPanelItems {
    name: string,
    action: ()=>void,
    checked?: boolean
}
