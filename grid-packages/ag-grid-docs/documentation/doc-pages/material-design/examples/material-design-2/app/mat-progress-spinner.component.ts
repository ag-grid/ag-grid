import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from "@ag-grid-community/core";

@Component({
    selector: 'progress-component',
    template: `
        <mat-progress-spinner *ngIf="!value"
                              [attr.color]="color"
                              [mode]="mode">
        </mat-progress-spinner>
        <div class="value" *ngIf="value">{{value}}</div>
    `,
    styles: [`
        .value {
            vertical-align: middle;
            line-height: 48px;
        }

        ::ng-deep
        .mat-progress-spinner {
            height: 45px !important;
            width: 45px !important;
        }

        ::ng-deep
        .mat-progress-spinner > svg {
            height: 45px !important;
            width: 45px !important;
        }
    `]
})
export class MatProgressSpinnerComponent implements ICellRendererAngularComp {
    params!: ICellRendererParams;
    value: any = null;

    color = 'primary';
    mode = 'indeterminate';

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = this.params.value;
    }

    refresh(params: any): boolean {
        this.params = params;
        this.value = this.params.value;
        return true;
    }
}

