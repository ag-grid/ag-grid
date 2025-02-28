import { Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    standalone: true,
    template: `
        <div role="gridcell" class="cell-renderer-outer">
            <form>
                <div>
                    <div>
                        <label>
                            Call Id:<br />
                            <input type="text" value="{{ firstRecord()?.callId }}" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Number:<br />
                            <input type="text" value="{{ firstRecord()?.number }}" />
                        </label>
                    </div>
                    <div>
                        <label>
                            Direction:<br />
                            <input type="text" value="{{ firstRecord()?.direction }}" />
                        </label>
                    </div>
                </div>
            </form>
        </div>
    `,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    firstRecord = signal<any>(undefined);
    // called on init
    agInit(params: any): void {
        this.firstRecord.set(params.data.callRecords[0]);
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }
}
