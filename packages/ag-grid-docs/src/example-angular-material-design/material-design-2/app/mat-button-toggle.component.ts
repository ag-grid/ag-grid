import {Component} from "@angular/core";
import {IHeaderAngularComp} from "ag-grid-angular";
import {ColumnAlignmentService} from "./columnAlignmentService";

@Component({
    selector: 'header-component',
    template: `
        <div class="container">
            <mat-button-toggle-group (change)="groupChanged($event)" class="group">
                <mat-button-toggle value="left">
                    <mat-icon>format_align_left</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="center">
                    <mat-icon>format_align_center</mat-icon>
                </mat-button-toggle>
                <mat-button-toggle value="right">
                    <mat-icon>format_align_right</mat-icon>
                </mat-button-toggle>
            </mat-button-toggle-group>
        </div>
    `,
    styles: [`
        .container {
            width: 100%;
        }

        .group {
            margin-left: 30px;
        }

        /deep/
        .ag-header-cell {
            text-align: left;
        }
    `]
})
export class MatButtonToggleHeaderComponent implements IHeaderAngularComp {
    params: any;

    agInit(params: any): void {
        this.params = params;
    }

    constructor(private columnAlignmentService: ColumnAlignmentService) {
    }

    groupChanged($event) {
        this.columnAlignmentService.changeColumnAlignment($event.value);
    }
}