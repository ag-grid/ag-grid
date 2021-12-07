import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div>
            <form>
                <div>
                    <p>
                        <label>
                            Calls:<br>
                            <input type="text" value={{callsCount}}>
                        </label>
                    </p>
                    <p>
                        <label>
                            Last Updated:
                            {{now}}
                        </label>
                    </p>
                </div>
            </form>
        </div>
    `
})
export class DetailCellRenderer implements ICellRendererAngularComp {

    public callsCount!: number;
    public now!: string;

    // called on init
    agInit(params: ICellRendererParams): void {
        this.callsCount = params.data.calls;
        this.now = new Date().toLocaleTimeString();
    }

    // called when the cell is refreshed
    refresh(params: ICellRendererParams): boolean {
        // check and see if we need to get the grid to tear this
        // component down and update it again
        if (params.data.calls != this.callsCount) {
            return false;
        } else {
            return true;
        }
    }
}
