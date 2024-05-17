import { ITooltipComp, ITooltipParams } from '@ag-grid-community/core';

export class CustomTooltip implements ITooltipComp {
    eGui: any;
    init(params: ITooltipParams) {
        var eGui = (this.eGui = document.createElement('div'));

        eGui.classList.add('custom-tooltip');

        if (params.location === 'setFilterValue') {
            eGui.innerHTML = '<strong>Full value:</strong> ' + params.value;
        } else {
            eGui.innerHTML = params.value;
        }
    }

    getGui() {
        return this.eGui;
    }
}
