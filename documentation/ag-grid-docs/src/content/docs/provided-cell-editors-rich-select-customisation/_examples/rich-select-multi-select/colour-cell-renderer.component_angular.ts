import { NgClass, NgFor, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgFor, NgClass, NgStyle],
    template: `
        <div [ngClass]="{ 'custom-color-cell-renderer': true, 'color-pill': isPill(), 'color-tag': !isPill() }">
            <ng-container *ngFor="let value of values()">
                <span
                    [ngStyle]="{
                        'background-color': backgroundColor(),
                        'border-color': value,
                        'box-shadow': boxShadow()
                    }"
                    >{{ value }}</span
                >
            </ng-container>
        </div>
    `,
    styles: [
        `
            :host {
                overflow: hidden;
            }

            .custom-color-cell-renderer.color-tag {
                overflow: 'hidden';
                text-overflow: 'ellipsis';
            }

            .custom-color-cell-renderer.color-tag span {
                border-left-width: 10px;
                border-left-style: solid;
                padding-left: 5px;
            }

            .ag-picker-field-display .custom-color-cell-renderer.color-pill {
                display: flex;
            }

            .custom-color-cell-renderer.color-pill span {
                padding: 0 5px;
                border-radius: 5px;
                border: 1px solid transparent;
            }

            .custom-color-cell-renderer.color-pill span:not(:first-child) {
                margin-left: 5px;
            }
        `,
    ],
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    params = signal<ICellRendererParams | undefined>(undefined);

    isPill = computed<boolean>(() => Array.isArray(this.params()?.value));

    values = computed<string[]>(() => {
        const value = this.params()?.value;
        return (this.isPill() ? value : [value]).filter((value: string | null) => value != null && value !== '');
    });
    backgroundColor = computed<string>(() =>
        this.isPill() ? `color-mix(in srgb, transparent, ${this.params()?.value} 20%)` : ''
    );
    boxShadow = computed<string>(() =>
        this.isPill() ? `0 0 0 1px color-mix(in srgb, transparent, ${this.params()?.value} 50%)` : ''
    );

    agInit(params: ICellRendererParams): void {
        this.params.set(params);
    }

    refresh() {
        return false;
    }
}
