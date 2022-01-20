import { ColGroupDef, ITooltipComp, ITooltipParams } from '@ag-grid-community/core'

export class CustomTooltip implements ITooltipComp {
    eGui!: HTMLElement;
    init(params: ITooltipParams) {
        const eGui = this.eGui = document.createElement('div');
        const isHeader = params.rowIndex === undefined;
        const isGroupedHeader = isHeader && !!(params.colDef as ColGroupDef).children;
        let str: string;
        let valueToDisplay: string;

        eGui.classList.add('custom-tooltip');

        if (isHeader) {
            str = '<p>Group Name: ' + params.value + '</p>';
            if (isGroupedHeader) {
                str += '<hr>';
                (params.colDef as ColGroupDef).children.forEach(function (header, idx) {
                    str += '<p>Child ' + (idx + 1) + ' - ' + header.headerName + '</p>';
                });
            }
            eGui.innerHTML = str;
        } else {
            valueToDisplay = params.value.value ? params.value.value : '- Missing -';

            eGui.innerHTML =
                '<p>Athlete\'s name:</p>' +
                '<p><span class"name">' + valueToDisplay + '</span></p>';
        }
    }

    getGui() {
        return this.eGui;
    }
}


