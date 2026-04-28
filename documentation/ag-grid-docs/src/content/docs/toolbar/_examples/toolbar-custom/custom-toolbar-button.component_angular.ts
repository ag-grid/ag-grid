import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { GridApi, IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

interface CustomToolbarToggleParams extends IToolbarItemParams {
    label?: string;
    title?: string;
    icon: string;
    panelId: string;
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
            [style.backgroundColor]="active ? 'var(--ag-button-background-color)' : null"
            (click)="onClick()"
        >
            <span class="ag-icon ag-icon-{{ icon }}" aria-hidden="true"></span>
            @if (label) {
                <span>{{ label }}</span>
            }
        </button>
    `,
})
export class CustomToolbarToggle implements IToolbarItemAngularComp, OnDestroy {
    private params!: CustomToolbarToggleParams;
    label = '';
    tooltip = '';
    icon = '';
    active = false;

    private panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
        if (key === this.params.panelId) {
            this.active = visible;
        } else if (visible) {
            this.active = false;
        }
    };

    agInit(params: CustomToolbarToggleParams): void {
        this.params = params;
        this.label = params.label ?? '';
        this.tooltip = params.title ?? params.label ?? '';
        this.icon = params.icon;
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    onClick(): void {
        this.params.onClick(this.params.api);
    }

    ngOnDestroy(): void {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
