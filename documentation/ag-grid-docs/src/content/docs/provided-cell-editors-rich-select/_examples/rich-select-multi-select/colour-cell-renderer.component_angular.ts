import type { ICellRendererAngularComp } from '@ag-grid-community/angular';
import type { ICellRendererParams } from '@ag-grid-community/core';
import { NgClass, NgFor, NgStyle } from '@angular/common';
import { Component } from '@angular/core';

import { getLuma } from './color-component-helper';

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
                    [ngStyle]="{ 'background-color': isPill ? value : null, 'border-color': !isPill ? value : null }"
                    [ngClass]="{ dark: isPill && getLuma(value) < 150 }"
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
            ,
            .custom-color-cell-renderer.color-tag {
                overflow: 'hidden';
                text-overflow: 'ellipsis';
            }

            .custom-color-cell-renderer.color-tag span {
                border-left-width: 10px;
                border-left-style: solid;
                padding-left: 5px;
            }

            .custom-color-cell-renderer.color-pill span {
                padding: 0 5px;
                border-radius: 5px;
            }

            .custom-color-cell-renderer.color-pill span:not(:first-child) {
                margin-left: 5px;
            }

            .custom-color-cell-renderer.color-pill span.dark {
                color: white;
            }

            [class^='ag-theme'][class$='dark'] .custom-color-cell-renderer.color-pill span:not(.dark) {
                color: black;
            }
        `,
    ],
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;
    public isPill!: boolean;
    public values!: string[];
    public getLuma!: (value: string) => number;

    agInit(params: ICellRendererParams): void {
        const { value } = params;

        this.params = params;
        this.isPill = Array.isArray(value);
        this.values = (this.isPill ? value : [value]).filter((value: string | null) => value != null && value !== '');
        this.getLuma = getLuma;
    }

    refresh() {
        return false;
    }
}
