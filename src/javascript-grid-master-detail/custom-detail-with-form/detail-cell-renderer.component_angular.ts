import {Component} from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div>
            <form>
                <div>
                    <p>
                        <label>
                            Call Id:<br>
                            <input type="text" value={{firstRecord.callId}}>
                        </label>
                    </p>
                    <p>
                        <label>
                            Number:<br>
                            <input type="text" value={{firstRecord.number}}>
                        </label>
                    </p>
                    <p>
                        <label>
                            Direction:<br>
                            <input type="text" value={{firstRecord.direction}}>
                        </label>
                    </p>
                </div>
            </form>
        </div>
    `
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    // called on init
    agInit(params: any): void {
        this.firstRecord = params.data.callRecords[0];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }
}