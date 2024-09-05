import type { IDragAndDropImageAngularComponent } from '@ag-grid-community/angular';
import type { IDragAndDropImageParams } from '@ag-grid-community/core';
import { NgClass } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    standalone: true,
    imports: [NgClass],
    template: `
        <div class="my-custom-drag-and-drop-cover">
            <i #eIcon class="fas fa-2x"></i>
            <div #eLabel></div>
        </div>
    `,
    styles: [
        `
            .my-custom-drag-and-drop-cover {
                background-color: blue;
                padding: 2rem;
                color: white !important;
                cursor: move;
                display: flex;
                align-items: center;
                border-radius: 0.5rem;
                gap: 0.5rem;
            }
        `,
    ],
})
export class CustomDragAndDropImage implements IDragAndDropImageAngularComponent {
    public params!: IDragAndDropImageParams;

    @ViewChild('eIcon', { read: ElementRef }) public eIcon!: ElementRef;
    @ViewChild('eLabel', { read: ElementRef }) public eLabel!: ElementRef;

    agInit(params: IDragAndDropImageParams): void {
        this.params = params;
    }

    setLabel(label: string) {
        this.eLabel.nativeElement.innerHTML = label;
    }

    setIcon(icon: string) {
        const { nativeElement } = this.eIcon;

        nativeElement.classList.toggle('fa-hand-point-left', icon === 'left');
        nativeElement.classList.toggle('fa-hand-point-right', icon === 'right');
        nativeElement.classList.toggle('fa-ban', icon === 'notAllowed');
        nativeElement.classList.toggle('fa-thumbtack', icon === 'pinned');
        nativeElement.classList.toggle('fa-walking', icon === 'move');
    }
}
