import { Component } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    standalone: true,
    template: `
        <div class="cell-renderer-outer">
            <form>
                <div>
                    <div>
                        <label>
                            Call Id:<br />
                            <input type="text" value="{{ firstRecord.callId }}" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Number:<br />
                            <input type="text" value="{{ firstRecord.number }}" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Direction:<br />
                            <input type="text" value="{{ firstRecord.direction }}" />
                        </label>
                    </div>
                </div>
            </form>
        </div>
    `,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    firstRecord!: any;
    // called on init
    agInit(params: any): void {
        this.firstRecord = params.data.callRecords[0];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }
}
