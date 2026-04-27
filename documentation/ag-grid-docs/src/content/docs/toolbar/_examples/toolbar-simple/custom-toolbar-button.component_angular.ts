import { ChangeDetectionStrategy, Component } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { GridApi, IToolbarItemParams } from 'ag-grid-community';

interface CustomToolbarButtonParams extends IToolbarItemParams {
    label?: string;
    title?: string;
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
            [attr.title]="tooltip"
            [attr.aria-label]="tooltip"
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
    tooltip = '';
    icon = '';

    agInit(params: CustomToolbarButtonParams): void {
        this.params = params;
        this.label = params.label ?? '';
        this.tooltip = params.title ?? params.label ?? '';
        this.icon = params.icon;
    }

    onClick(): void {
        this.params.onClick(this.params.api);
    }
}
