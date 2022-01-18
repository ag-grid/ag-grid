import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class GenderRenderer implements ICellRendererComp {
    eGui!: HTMLSpanElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('span');
        var img = params.value === 'Male' ? 'male.png' : 'female.png';
        this.eGui.innerHTML = `<img src="https://www.ag-grid.com/example-assets/genders/${img}"/> ${params.value}`;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

