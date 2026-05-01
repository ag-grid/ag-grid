import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { IToolbarItemAngularComp } from 'ag-grid-angular';
import type { IToolbarItemParams, ToolPanelVisibleChangedEvent } from 'ag-grid-community';

const OPTIONS = [
    { value: 'filters-new', label: 'Filters' },
    { value: 'columns', label: 'Columns' },
    { value: 'none', label: 'None' },
];

@Component({
    standalone: true,
    imports: [FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="ag-toolbar-item" role="radiogroup" aria-label="Tool panel">
            @for (option of options; track option.value) {
                <label style="margin-right: 8px;">
                    <input
                        type="radio"
                        [name]="groupName"
                        [value]="option.value"
                        [checked]="selected === option.value"
                        (change)="onSelect(option.value)"
                        style="margin-right: 4px;"
                    />
                    {{ option.label }}
                </label>
            }
        </div>
    `,
})
export class ToolPanelRadio implements IToolbarItemAngularComp, OnDestroy {
    private params!: IToolbarItemParams;
    options = OPTIONS;
    groupName = '';
    selected = 'none';

    constructor(private cdr: ChangeDetectorRef) {}

    private panelListener = ({ key, visible }: ToolPanelVisibleChangedEvent) => {
        if (visible) {
            this.selected = key;
        } else if (this.selected === key) {
            this.selected = 'none';
        }
        this.cdr.markForCheck();
    };

    agInit(params: IToolbarItemParams): void {
        this.params = params;
        this.groupName = `tool-panel-${params.key}`;
        params.api.addEventListener('toolPanelVisibleChanged', this.panelListener);
    }

    onSelect(value: string): void {
        if (value === 'none') {
            this.params.api.closeToolPanel();
        } else {
            this.params.api.openToolPanel(value);
        }
    }

    ngOnDestroy(): void {
        this.params.api.removeEventListener('toolPanelVisibleChanged', this.panelListener);
    }
}
