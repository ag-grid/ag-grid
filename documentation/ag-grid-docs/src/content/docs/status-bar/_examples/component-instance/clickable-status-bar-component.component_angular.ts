import { IStatusPanelAngularComp } from '@ag-grid-community/angular';
import { IStatusPanelParams } from '@ag-grid-community/core';
import { Component } from '@angular/core';

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
