import {Component} from "@angular/core";
import {ICellRendererAngularComp} from "ag-grid-angular/dist/interfaces";

@Component({
    selector: 'progress-component',
    template: `
        <md-progress-spinner *ngIf="!value"
                [attr.color]="color"
                [mode]="mode">
        </md-progress-spinner>
        <div class="value" *ngIf="value">{{value}}</div>
    `,
    styles: [`
        .value {
            vertical-align: middle;
            line-height: 48px;
        }

        /deep/
        .mat-progress-spinner {
            height: 48px !important;
            width: 48px !important;
        }
    `]
})
export class MdProgressSpinnerComponent implements ICellRendererAngularComp {
    params: any;
    value: any = null;

    color = 'primary';
    mode = 'indeterminate';

    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
    }

    refresh(params: any) {
        this.params = params;
        this.value = this.params.value;
    }
}

