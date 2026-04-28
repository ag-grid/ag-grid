import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

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
    private params!: IToolbarItemParams;
    label = '';
    tooltip = '';
    icon = '';
    active = false;

    private panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
        if (key === this.params.toolbarItemParams.panelId) {
            this.active = visible;
        } else if (visible) {
            this.active = false;
        }
    };

    agInit(params: IToolbarItemParams): void {
        this.params = params;
        const { label, title, icon } = params.toolbarItemParams;
        this.label = label ?? '';
        this.tooltip = title ?? label ?? '';
        this.icon = icon;
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    onClick(): void {
        this.params.toolbarItemParams.onClick(this.params.api);
    }

    ngOnDestroy(): void {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
