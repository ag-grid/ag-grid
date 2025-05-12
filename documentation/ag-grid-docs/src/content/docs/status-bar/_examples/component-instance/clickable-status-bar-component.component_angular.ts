import { Component, signal } from '@angular/core';

import type { IStatusPanelAngularComp } from 'ag-grid-angular';
import type { IStatusPanelParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        @if (visible) {
            <div class="container">
                <div>
                    <span class="component">
                        Status Bar Component <input type="button" (click)="onClick()" value="Click Me" />
                        {{ text }}
                    </span>
                </div>
            </div>
        }
    `,
})
export class ClickableStatusBarComponent implements IStatusPanelAngularComp {
    public params!: IStatusPanelParams;
    public visible = true;
    private text = signal<string>('');

    agInit(params: IStatusPanelParams): void {
        this.params = params;
    }

    onClick(): void {
        this.text.set(this.params.api.getSelectedRows().length + ' selected');
    }

    setVisible(visible: boolean) {
        this.visible = visible;
    }

    isVisible(): boolean {
        return this.visible;
    }
}
