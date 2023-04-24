import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class DetailCellRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {

        var firstRecord = params.data.callRecords[0];

        this.eGui = document.createElement('div');
        this.eGui.innerHTML =
            '<form>' +
            '  <div>' +
            '  <p>' +
            '    <label>' +
            '      Call Id:<br>' +
            '    <input type="text" value="' + firstRecord.callId + '">' +
            '    </label>' +
            '  </p>' +
            '  <p>' +
            '    <label>' +
            '      Number:<br>' +
            '    <input type="text" value="' + firstRecord.number + '">' +
            '    </label>' +
            '  </p>' +
            '  <p>' +
            '    <label>' +
            '      Direction:<br>' +
            '    <input type="text" value="' + firstRecord.direction + '">' +
            '    </label>' +
            '  </p>' +
            '</form>' +
            '</div>';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}