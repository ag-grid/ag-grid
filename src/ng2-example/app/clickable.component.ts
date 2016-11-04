import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'ag-clickable',
    template: `
    <button (click)="click()">Click Me</button>
  `
})
export class ClickableComponent {
    @Input() cell:any;
    @Output() onClicked = new EventEmitter<boolean>();

    click() : void {
        this.onClicked.emit(this.cell);
    }
}
