import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

interface PanelToggleParams {
    label: string;
    icon: string;
    panelId: string;
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
            [style.backgroundColor]="active ? 'var(--ag-button-background-color)' : null"
            (click)="toggle()"
        >
            <span class="ag-icon ag-icon-{{ icon }}" aria-hidden="true"></span>
            <span>{{ label }}</span>
        </button>
    `,
})
export class CustomPanelToggle implements IToolbarItemAngularComp, OnDestroy {
    private params!: IToolbarItemParams<any, any, PanelToggleParams>;
    label = '';
    icon = '';
    active = false;

    constructor(private cdr: ChangeDetectorRef) {}

    private panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
        const { panelId } = this.params.toolbarItemParams!;
        if (key === panelId) {
            this.active = visible;
        } else if (visible) {
            this.active = false;
        }
        this.cdr.markForCheck();
    };

    agInit(params: IToolbarItemParams<any, any, PanelToggleParams>): void {
        this.params = params;
        const { label, icon } = params.toolbarItemParams!;
        this.label = label;
        this.icon = icon;
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    // Public method, accessible via api.getToolbarItemInstance(key).
    toggle(): void {
        const { panelId } = this.params.toolbarItemParams!;
        if (this.params.api.getOpenedToolPanel() === panelId) {
            this.params.api.closeToolPanel();
        } else {
            this.params.api.openToolPanel(panelId);
        }
    }

    ngOnDestroy(): void {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
