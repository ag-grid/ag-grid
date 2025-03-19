import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

import { getFileCssIcon } from './fileUtils';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule],
    template: `
        <span class="filename">
            <i [ngClass]="fileIconClass()"></i>
            {{ value() }}
        </span>
    `,
})
export class FileCellRenderer implements ICellRendererAngularComp {
    public value = signal('');
    public fileIconClass = signal('');

    agInit(params: ICellRendererParams): void {
        this.setParams(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.setParams(params);
        return true;
    }

    private setParams({ value, data }: ICellRendererParams): void {
        this.value.set(value);
        this.fileIconClass.set(getFileCssIcon(data?.type, value));
    }
}
