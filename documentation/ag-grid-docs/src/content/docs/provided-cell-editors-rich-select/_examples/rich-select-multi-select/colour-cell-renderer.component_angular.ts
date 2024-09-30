import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    standalone: true,
    imports: [NgFor, NgClass, NgStyle],
    template: `
        <div [ngClass]="{ 'custom-color-cell-renderer': true, 'color-pill': isPill, 'color-tag': !isPill }">
            <ng-container *ngFor="let value of values">
                <span
                    [ngStyle]="{ 'background-color': backgroundColor, 'border-color': value, 'box-shadow': boxShadow }"
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
    public params!: ICellRendererParams;
    public isPill!: boolean;
    public values!: string[];
    public backgroundColor!: string;
    public boxShadow!: string;

    agInit(params: ICellRendererParams): void {
        const { value } = params;

        this.params = params;
        const isPill = (this.isPill = Array.isArray(value));
        this.values = (this.isPill ? value : [value]).filter((value: string | null) => value != null && value !== '');
        this.backgroundColor = isPill ? `color-mix(in srgb, transparent, ${value} 20%)` : '';
        this.boxShadow = isPill ? `0 0 0 1px color-mix(in srgb, transparent, ${value} 50%)` : '';
    }

    refresh() {
        return false;
    }
}
