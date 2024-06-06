import type { ICellRendererAngularComp } from '@ag-grid-community/angular';
import type { ICellRendererParams } from '@ag-grid-community/core';
import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';

// simple cell renderer returns dummy buttons. in a real application, a component would probably
// be used with operations tied to the buttons. in this example, the cell renderer is just for
// display purposes.
@Component({
    standalone: true,
    imports: [NgFor, NgIf],
    template: `
        <div [style.overflow]="'hidden'" [style.textOverflow]="'ellipsis'">
            <ng-container *ngFor="let value of values; let last = last">
                <span [style.borderLeft]="'10px solid ' + value" [style.paddingRight]="'2px'"></span>{{ value }}
                <ng-container *ngIf="!last">, </ng-container>
            </ng-container>
        </div>
    `,
    styles: [
        `
            :host {
                overflow: hidden;
            }
        `,
    ],
})
export class ColourCellRenderer implements ICellRendererAngularComp {
    public params!: ICellRendererParams;
    private values: string[];

    agInit(params: ICellRendererParams): void {
        const { value } = params;

        this.params = params;
        this.values = Array.isArray(value) ? value : [value];
    }

    refresh() {
        return false;
    }
}
