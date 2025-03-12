import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

interface MissionCellRendererParams extends ICellRendererParams {
    src?: (params: boolean) => string;
}

export class MissionResultRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    init(params: MissionCellRendererParams) {
        const icon: HTMLImageElement = document.createElement('img');
        if (params.src) {
            icon.src = params.src(params.value);
        } else {
            icon.src = `https://www.ag-grid.com/example-assets/icons/${
                params.value ? 'tick-in-circle' : 'cross-in-circle'
            }.png`;
        }
        icon.setAttribute('class', 'missionIcon');

        this.eGui = document.createElement('span');
        this.eGui.setAttribute('class', 'missionSpan');
        this.eGui.appendChild(icon);
    }

    getGui() {
        return this.eGui;
    }

    // Required: Get the cell to refresh.
    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}
