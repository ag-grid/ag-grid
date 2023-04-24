import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;
    callsCount: any;

    init(params: ICellRendererParams) {

        this.callsCount = params.data.calls;

        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<form>' +
            '  <div>' +
            '  <p>' +
            '    <label>' +
            '      Calls:<br>' +
            '    <input type="text" value="' + this.callsCount + '">' +
            '    </label>' +
            '  </p>' +
            '  <p>' +
            '    <label>' +
            '        Last Updated: ' + new Date().toLocaleTimeString() +
            '    </label>' +
            '  </p>' +
            '</form>' +
            '</div>';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams) {
        // check and see if we need to get the grid to tear this
        // component down and update it again
        if (params.data.calls != this.callsCount) {
            return false;
        } else {
            return true;
        }
    }
}