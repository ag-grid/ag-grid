import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';

function setStyle(element: any, propertyObject: any) {
    for (const property in propertyObject) {
        element.style[property] = propertyObject[property];
    }
}
export class CustomPinnedRowRenderer implements ICellRendererComp {
    private eGui!: HTMLDivElement;

    init(params: ICellRendererParams & { style: any }) {
        this.eGui = document.createElement('div');
        setStyle(this.eGui, params.style);
        this.eGui.innerHTML = params.value;
    }

    getGui() {
        return this.eGui;
    }

    refresh() {
        return false;
    }
}
