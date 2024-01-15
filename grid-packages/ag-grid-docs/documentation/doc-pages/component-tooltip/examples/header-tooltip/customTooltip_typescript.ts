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
            eGui.classList.add('custom-tooltip-grouped');

            str = '<span>Group Name: ' + params.value + '</span>';
            if (isGroupedHeader) {
                (params.colDef as ColGroupDef).children.forEach(function (header, idx) {
                    str += '<span>Child ' + (idx + 1) + ' - ' + header.headerName + '</span>';
                });
            }
            eGui.innerHTML = str;
        } else {
            valueToDisplay = params.value.value ? params.value.value : '- Missing -';

            eGui.innerHTML =
                '<span>Athlete\'s name:</span>' +
                '<span class"name">' + valueToDisplay + '</span>';
        }
    }

    getGui() {
        return this.eGui;
    }
}


