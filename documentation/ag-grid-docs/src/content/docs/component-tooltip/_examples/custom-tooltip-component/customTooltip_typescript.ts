import type { ITooltipComp, ITooltipParams } from 'ag-grid-community';

export class CustomTooltip implements ITooltipComp {
    eGui: any;
    init(params: ITooltipParams & { color: string }) {
        const eGui = (this.eGui = document.createElement('div'));
        const color = params.color || '#999';

        eGui.classList.add('custom-tooltip');
        //@ts-ignore
        eGui.style['background-color'] = color;
        eGui.innerHTML = `
            <div><b>Custom Tooltip</b></div>
            <div>${params.value}</div>
        `;
    }

    getGui() {
        return this.eGui;
    }
}
