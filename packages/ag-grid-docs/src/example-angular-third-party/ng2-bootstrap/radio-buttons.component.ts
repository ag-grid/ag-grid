import {Component} from "@angular/core";
import {ICellRendererAngularComp, ICellEditorAngularComp} from "ag-grid-angular/main";

@Component({
    selector: 'radio-renderer-cell',
    template: `
        <span class="btn-group">
            <label class="btn btn-primary" [ngModel]="radioModel" (ngModelChange)="onChange($event)" btnRadio="On">On</label>
            <label class="btn btn-primary" [ngModel]="radioModel" (ngModelChange)="onChange($event)" btnRadio="Off">Off</label>
        </span>
    `,
    styles: ['.btn { height: 20px; padding-top: 0; padding-bottom: 0;} ']
})
export class BootstrapRadioComponent implements ICellEditorAngularComp, ICellRendererAngularComp {
    private params: any;

    public radioModel: string = 'on';

    agInit(params: any): void {
        this.params = params;
        this.radioModel = this.params.value;
    }

    // demonstrates how you can do "inline" editing of a cell
    onChange($event) {
        this.radioModel = $event;
        this.params.node.setDataValue(this.params.colDef, this.radioModel);
    }

    getValue() {
        return this.radioModel;
    }
}