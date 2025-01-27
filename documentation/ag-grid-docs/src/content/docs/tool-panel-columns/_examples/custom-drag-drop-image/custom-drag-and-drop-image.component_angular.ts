import { Component, ElementRef, ViewChild } from '@angular/core';

import type { IDragAndDropImageAngularComponent } from 'ag-grid-angular';
import type { IDragAndDropImageParams } from 'ag-grid-community';

@Component({
    standalone: true,
    template: `
        <div #eImage class="my-custom-drag-and-drop-cover">
            <i #eIcon class="fas fa-2x"></i>
            <div #eLabel></div>
        </div>
    `,
    styles: [
        `
            .my-custom-drag-and-drop-cover {
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
    public params!: IDragAndDropImageParams & { accentColour: string };

    @ViewChild('eImage', { read: ElementRef }) public eImage!: ElementRef;
    @ViewChild('eIcon', { read: ElementRef }) public eIcon!: ElementRef;
    @ViewChild('eLabel', { read: ElementRef }) public eLabel!: ElementRef;

    agInit(params: IDragAndDropImageParams & { accentColour: string }): void {
        this.params = params;
    }

    ngAfterViewInit() {
        this.eImage.nativeElement.style.setProperty('background-color', this.params.accentColour);
    }

    setLabel(label: string) {
        this.eLabel.nativeElement.innerHTML = label;
    }

    setIcon(icon: string) {
        const { eIcon, params } = this;
        const { nativeElement } = eIcon;
        const { dragSource } = params;

        if (!nativeElement || !dragSource) {
            return;
        }

        if (!icon) {
            icon = dragSource.getDefaultIconName ? dragSource.getDefaultIconName() : 'notAllowed';
        }

        if (icon === 'hide' && params.api.getGridOption('suppressDragLeaveHidesColumns')) {
            return;
        }

        nativeElement.classList.toggle('fa-hand-point-left', icon === 'left');
        nativeElement.classList.toggle('fa-hand-point-right', icon === 'right');
        nativeElement.classList.toggle('fa-ban', icon === 'notAllowed');
        nativeElement.classList.toggle('fa-mask', icon === 'hide');
        nativeElement.classList.toggle('fa-thumbtack', icon === 'pinned');
        nativeElement.classList.toggle('fa-walking', icon === 'move');
        nativeElement.classList.toggle('fa-layer-group', icon === 'group');
        nativeElement.classList.toggle('fa-table', icon === 'aggregate');
        nativeElement.classList.toggle('fa-ruler-combined', icon === 'pivot');
    }
}
