import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    selector: 'app-company-logo-renderer',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    template: `
        <span :class="imgSpanLogo">
            @if (value()) {
                <img
                    [alt]="value()"
                    [src]="'https://www.ag-grid.com/example-assets/software-company-logos/' + valueLowerCase() + '.svg'"
                    [height]="30"
                    :class="logo"
                />
            }
        </span>
    `,
})
export class CompanyLogoRenderer implements ICellRendererAngularComp {
    value = signal('');
    valueLowerCase = computed(() => this.value().toLowerCase());

    agInit(params: ICellRendererParams): void {
        this.refresh(params);
    }

    refresh(params: ICellRendererParams): boolean {
        this.value.set(params.value);
        return true;
    }
}
