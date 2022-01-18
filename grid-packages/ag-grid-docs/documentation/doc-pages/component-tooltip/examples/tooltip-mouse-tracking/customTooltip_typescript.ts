import { ITooltipComp, ITooltipParams } from '@ag-grid-community/core'

export class CustomTooltip implements ITooltipComp {
    eGui!: HTMLElement;
    init(params: ITooltipParams & { type: string }) {
        const type = params.type || 'primary';
        const data = params.api!.getDisplayedRowAtIndex(params.rowIndex!)!.data;
        const eGui = this.eGui = document.createElement('div');

        eGui.classList.add('custom-tooltip');
        this.eGui.innerHTML = `
            <div class="panel panel-${type}">
                <div class="panel-heading">
                    <h3 class="panel-title">${data.country}</h3>
                </div>
                <div class="panel-body">
                    <h4 style="white-space: nowrap;">${data.athlete}</h4>
                    <p>Total: ${data.total}</p>
                </div>
            </div>`;
    }

    getGui() {
        return this.eGui;
    }
}

