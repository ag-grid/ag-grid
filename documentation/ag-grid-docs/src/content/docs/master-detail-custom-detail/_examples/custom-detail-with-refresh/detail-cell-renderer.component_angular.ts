import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div>
            <form>
                <div>
                    <p>
                        <label>
                            Calls:<br />
                            <input type="text" value="{{ callsCount }}" />
                        </label>
                    </p>
                    <p>
                        <label>
                            Last Updated:
                            {{ now }}
                        </label>
                    </p>
                </div>
            </form>
        </div>
    `,
})
export class DetailCellRenderer implements ICellRendererAngularComp {
    public callsCount!: number;
    public now!: string;

    // called on init
    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    // called when the cell is refreshed
    refresh(params: ICellRendererParams): boolean {
        this.callsCount = params.data.calls;
        this.now = new Date().toLocaleTimeString();
        // tell the grid not to destroy and recreate
        return true;
    }
}
