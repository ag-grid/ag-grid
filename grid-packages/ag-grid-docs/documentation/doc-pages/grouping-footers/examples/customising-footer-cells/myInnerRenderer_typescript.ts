import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class MyInnerRenderer implements ICellRendererComp {

    eGui!: HTMLDivElement;

    // gets called once before the renderer is used
    init(params: ICellRendererParams) {
        // create the cell
        this.eGui = document.createElement('div');

        let template: string;

        if (params.node.footer) {
            const isRootLevel = params.node.level === -1;
            if (isRootLevel) {
              template = `<span style="color:navy; font-weight:bold">Grand Total</span>`;
            } else {
              template = `<span style="color:navy">Sub Total ${params.value}</span>`;
            }
          } else {
              template = params.value;
          }

          this.eGui.innerHTML = template;
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams) {
        return false;
    }
}
