import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { GridApi, IToolbarItemParams } from 'ag-grid-community';

interface CustomToolbarButtonParams extends IToolbarItemParams {
    label: string;
    icon: string;
    onClick: (api: GridApi) => void;
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <button
            class="ag-toolbar-item ag-toolbar-button"
            type="button"
            [attr.title]="label"
            [attr.aria-label]="label"
            (click)="onClick()"
        >
            <span class="ag-icon ag-icon-{{ icon }}" aria-hidden="true"></span>
            @if (label) {
                <span>{{ label }}</span>
            }
        </button>
    `,
})
export class CustomToolbarButton implements IToolbarItemAngularComp {
    private params!: CustomToolbarButtonParams;
    label = '';
    icon = '';

    agInit(params: CustomToolbarButtonParams): void {
        this.params = params;
        this.label = params.label;
        this.icon = params.icon;
    }

    onClick(): void {
        this.params.onClick(this.params.api);
    }
}
