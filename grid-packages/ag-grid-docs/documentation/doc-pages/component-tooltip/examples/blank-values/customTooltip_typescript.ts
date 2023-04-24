import { ITooltipComp, ITooltipParams } from '@ag-grid-community/core'

export class CustomTooltip implements ITooltipComp {
    eGui!: HTMLElement;
    init(params: ITooltipParams) {
        const eGui = this.eGui = document.createElement('div');
        eGui.classList.add('custom-tooltip');

        const valueToDisplay = params.value.value ? params.value.value : '- Missing -';

        eGui.innerHTML = `<p>Athlete's name:</p><p><span class"name">${valueToDisplay}</span></p>`;
    }

    getGui() {
        return this.eGui;
    }
}

