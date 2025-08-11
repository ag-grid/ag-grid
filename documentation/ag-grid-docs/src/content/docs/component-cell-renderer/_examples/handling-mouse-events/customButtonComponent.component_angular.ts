import { Component, ElementRef, ViewChild } from '@angular/core';

import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    standalone: true,
    template: `<button #eButton (click)="buttonClicked()">Custom Button</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    @ViewChild('eButton') eButton!: ElementRef;

    agInit(): void {}

    refresh() {
        return true;
    }

    buttonClicked() {
        console.log('Button clicked');
    }
}
