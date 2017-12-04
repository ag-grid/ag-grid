import {Component} from "@angular/core";
import {IHeaderAngularComp} from "ag-grid-angular/main";
import {ColumnAlignmentService} from "../services/columnAlignmentService";

@Component({
    selector: 'header-component',
    template: `
        <div class="container">
            <md-button-toggle-group (change)="groupChanged($event)">
                <md-button-toggle value="left">
                    <md-icon>format_align_left</md-icon>
                </md-button-toggle>
                <md-button-toggle value="center">
                    <md-icon>format_align_center</md-icon>
                </md-button-toggle>
                <md-button-toggle value="right">
                    <md-icon>format_align_right</md-icon>
                </md-button-toggle>
            </md-button-toggle-group>
        </div>
    `,
    styles: [`
        .container {
            width: 100%;
        }

        /deep/
        .ag-header-cell {
            text-align: left;
        }
    `]
})
export class MdButtonToggleHeaderComponent implements IHeaderAngularComp {
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