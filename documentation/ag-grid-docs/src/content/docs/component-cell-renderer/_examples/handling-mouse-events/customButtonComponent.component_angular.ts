import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    standalone: true,
    template: `<button #eButton (click)="buttonClicked()">Custom Button</button>`,
})
export class CustomButtonComponent implements ICellRendererAngularComp {
    @ViewChild('eButton') eButton!: ElementRef;

    agInit(params: ICellRendererParams): void {}

    refresh(params: ICellRendererParams) {
        return true;
    }

    buttonClicked() {
        console.log('Button clicked');
    }

    suppressGridClickHandling(event: MouseEvent) {
        return this.eButton.nativeElement.contains(event.target as HTMLElement);
    }
}
