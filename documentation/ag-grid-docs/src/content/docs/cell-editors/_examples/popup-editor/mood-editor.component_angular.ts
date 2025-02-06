import { NgClass } from '@angular/common';
import type { AfterViewInit } from '@angular/core';
import { Component, ViewChild, ViewContainerRef } from '@angular/core';

import type { ICellEditorAngularComp } from 'ag-grid-angular';

@Component({
    standalone: true,
    imports: [NgClass],
    template: `
        <div #container class="mood" tabindex="0" (keydown)="onKeyDown($event)">
            <img
                src="https://www.ag-grid.com/example-assets/smileys/happy.png"
                (click)="onClick(true)"
                [ngClass]="{ selected: happy, default: !happy }"
            />
            <img
                src="https://www.ag-grid.com/example-assets/smileys/sad.png"
                (click)="onClick(false)"
                [ngClass]="{ selected: !happy, default: happy }"
            />
        </div>
    `,
})
export class MoodEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;

    @ViewChild('container', { read: ViewContainerRef }) public container!: ViewContainerRef;
    public happy = false;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            this.container.element.nativeElement.focus();
        });
    }

    agInit(params: any): void {
        this.params = params;
        this.setHappy(params.value === 'Happy');
    }

    getValue(): any {
        return this.happy ? 'Happy' : 'Sad';
    }

    setHappy(happy: boolean): void {
        this.happy = happy;
    }

    toggleMood(): void {
        this.setHappy(!this.happy);
    }

    onClick(happy: boolean) {
        this.setHappy(happy);
        this.params.stopEditing();
    }

    onKeyDown(event: any): void {
        const key = event.key;
        if (
            key == 'ArrowLeft' || // left
            key == 'ArrowRight'
        ) {
            // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}
