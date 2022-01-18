import { ICellRendererComp, ICellRendererParams } from "@ag-grid-community/core";

export class TotalValueRenderer implements ICellRendererComp {
    eGui!: HTMLDivElement;
    eButton: any;
    eValue: any;
    cellValue: any;
    eventListener!: () => void;

    // gets called once before the renderer is used
    init(params: ICellRendererParams) {
        // create the cell
        this.eGui = document.createElement('div');
        this.eGui.innerHTML = `
          <span>
              <span class="my-value"></span>
              <button class="btn-simple">Push For Total</button>
          </span>
       `;

        // get references to the elements we want
        this.eButton = this.eGui.querySelector('.btn-simple');
        this.eValue = this.eGui.querySelector('.my-value');

        // set value into cell
        this.cellValue = this.getValueToDisplay(params);
        this.eValue.innerHTML = this.cellValue;

        // add event listener to button
        this.eventListener = () => alert(`${this.cellValue} medals won!`);
        this.eButton.addEventListener('click', this.eventListener);
    }

    getGui() {
        return this.eGui;
    }

    // gets called whenever the cell refreshes
    refresh(params: ICellRendererParams) {
        // set value into cell again
        this.cellValue = this.getValueToDisplay(params);
        this.eValue.innerHTML = this.cellValue;

        // return true to tell the grid we refreshed successfully
        return true;
    }

    // gets called when the cell is removed from the grid
    destroy() {
        // do cleanup, remove event listener from button
        if (this.eButton) {
            // check that the button element exists as destroy() can be called before getGui()
            this.eButton.removeEventListener('click', this.eventListener);
        }
    }

    getValueToDisplay(params: ICellRendererParams) {
        return params.valueFormatted ? params.valueFormatted : params.value;
    }
}
