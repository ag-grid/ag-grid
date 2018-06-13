import {Component} from "@angular/core";
import {ICellEditorAngularComp} from "ag-grid-angular/main";

@Component({
    selector: 'date-editor-cell',
    template: `
        <datepicker (selectionDone)="onClick($event)" [showWeeks]="false"></datepicker>
    `
})
export class BootstrapDatePickerComponent implements ICellEditorAngularComp {
    private params: any;

    public selectedDate: Date = new Date();

    agInit(params: any): void {
        this.params = params;
    }

    getValue(): any {
        return `${this.selectedDate.getDate()}/${this.selectedDate.getMonth() + 1}/${this.selectedDate.getFullYear()}`;
    }

    isPopup(): boolean {
        return true;
    }

    onClick(date:Date) {
        this.selectedDate = date;
        this.params.api.stopEditing();
    }
}