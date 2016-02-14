import Column from "../entities/column";
import _ from '../utils';
import {ColumnController} from "../columnController/columnController";

export class ColumnPinnedPanel {

    private static TEMPLATE =
        `<div class="ag-menu-panel">
            <div class="ag-menu-panel-title">
                Pinning
            </div>
            <div>
                <label>
                    <input id="rbLeft" name="RADIO_BUTTON_NAME" type="radio"/> Left
                </label>
                <label>
                    <input id="rbCenter" name="RADIO_BUTTON_NAME" type="radio"/> None
                </label>
                <label>
                    <input id="rbRight" name="RADIO_BUTTON_NAME" type="radio"/> Right
                </label>
            </div>
        </div>`;

    private eGui: HTMLElement;
    private column: Column;
    private columnController: ColumnController;

    constructor(column: Column, columnController: ColumnController) {
        this.column = column;
        this.columnController = columnController;

        var template = ColumnPinnedPanel.TEMPLATE.replace(new RegExp('RADIO_BUTTON_NAME', 'g'), Math.random().toString());
        console.log('template = ' + template);
        this.eGui = <HTMLElement> _.loadTemplate(template);

        var cbLeft = <HTMLInputElement> this.eGui.querySelector('#rbLeft');
        var cbCenter = <HTMLInputElement> this.eGui.querySelector('#rbCenter');
        var cbRight = <HTMLInputElement> this.eGui.querySelector('#rbRight');

        switch (column.getPinned()) {
            case Column.PINNED_LEFT: cbLeft.checked = true; break;
            case Column.PINNED_RIGHT: cbRight.checked = true; break;
            default: cbCenter.checked = true; break;
        }

        cbLeft.addEventListener('click', this.setPinned.bind(this, Column.PINNED_LEFT));
        cbCenter.addEventListener('click', this.setPinned.bind(this, null));
        cbRight.addEventListener('click', this.setPinned.bind(this, Column.PINNED_RIGHT));
    }

    private setPinned(pinnedValue: string): void {
        this.columnController.setColumnPinned(this.column, pinnedValue);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

}
