import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams } from 'ag-grid-community';

const PANELS = [
    { value: 'filters', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
];

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div
            class="ag-toolbar-item"
            role="radiogroup"
            style="display: flex; gap: 12px; padding: 10px; align-items: center;"
        >
            <span>Tool Panel:</span>
            @for (option of options; track option.value) {
                <label style="display: inline-flex; align-items: center; gap: 4px; padding: 0 4px;">
                    <input
                        type="radio"
                        [name]="groupName"
                        [value]="option.value"
                        [checked]="selected === option.value"
                        (change)="onChange(option.value)"
                        style="margin: 0;"
                    />
                    {{ option.label }}
                </label>
            }
        </div>
    `,
})
export class ToolPanelRadio implements IToolbarItemAngularComp {
    private params!: IToolbarItemParams;
    options = PANELS;
    groupName = '';
    selected = 'none';

    constructor(private cdr: ChangeDetectorRef) {}

    agInit(params: IToolbarItemParams): void {
        this.params = params;
        this.groupName = `tool-panel-${params.key}`;
    }

    onChange(value: string): void {
        if (value === 'none') {
            this.params.api.closeToolPanel();
        } else {
            this.params.api.openToolPanel(value);
        }
    }

    // Public method, called externally via api.getToolbarItemInstance(key).
    setSelected(value: string): void {
        this.selected = value;
        this.cdr.markForCheck();
    }
}
