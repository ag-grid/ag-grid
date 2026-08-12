import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { IColumnSelectionLabelRendererAngularComp } from 'ag-grid-angular';
import type { IColumnSelectionLabelRendererParams } from 'ag-grid-community';

interface CustomColumnLabelParams {
    columnIcon: string;
    columnGroupIcon: string;
}

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <span
            class="custom-column-label"
            [attr.data-kind]="isGroup() ? 'group' : 'column'"
            [attr.data-source]="source()"
        >
            <span class="custom-column-label-icon">{{ icon() }}</span>
            <span class="custom-column-label-text">{{ displayName() }}</span>
        </span>
    `,
})
export class CustomColumnLabel implements IColumnSelectionLabelRendererAngularComp {
    readonly displayName = signal<string | null>(null);
    readonly icon = signal('');
    readonly isGroup = signal(false);
    readonly source = signal('');

    public agInit(params: IColumnSelectionLabelRendererParams & CustomColumnLabelParams): void {
        this.update(params);
    }

    public refresh(params: IColumnSelectionLabelRendererParams & CustomColumnLabelParams): boolean {
        this.update(params);
        return true;
    }

    private update(params: IColumnSelectionLabelRendererParams & CustomColumnLabelParams): void {
        const isGroup = params.columnGroup != null;
        this.displayName.set(params.displayName);
        this.icon.set(isGroup ? params.columnGroupIcon : params.columnIcon);
        this.isGroup.set(isGroup);
        this.source.set(params.source);
    }
}
