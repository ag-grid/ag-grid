import {Component} from "@angular/core";

@Component({
    selector: 'medal-component',
    template: `<span>{{this.displayValue}}</span>`
})
export class MedalCellRenderer {
    private params: any;
    private displayValue: string;

    agInit(params: any): void {
        this.params = params;
        this.displayValue = new Array(params.value).fill('#').join('');
    }

    medalUserFunction() {
        console.log(`user function called for medal column: row = ${this.params.rowIndex}, column = ${this.params.column.getId()}`);
    }

}
