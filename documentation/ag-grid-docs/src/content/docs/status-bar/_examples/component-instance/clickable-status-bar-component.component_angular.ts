import { Component } from '@angular/core';

import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { IStatusPanelParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        @if (visible) {
            <div class="container">
                <div>
                    <span class="component"
                        >Status Bar Component <input type="button" (click)="onClick()" value="Click Me"
                    /></span>
                </div>
            </div>
        }
    `,
})
export class ClickableStatusBarComponent implements IStatusPanelAngularComp {
    public params!: IStatusPanelParams;
    public visible = true;

    agInit(params: IStatusPanelParams): void {
        this.params = params;
    }

    onClick(): void {
        alert('Selected Row Count: ' + this.params.api.getSelectedRows().length);
    }

    setVisible(visible: boolean) {
        this.visible = visible;
    }

    isVisible(): boolean {
        return this.visible;
    }
}
