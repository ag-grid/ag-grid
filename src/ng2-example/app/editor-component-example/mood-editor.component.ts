import {Component, ViewContainerRef, ViewChild, AfterViewInit} from '@angular/core';

import {ICellEditorAngularComp} from 'ag-grid-angular/main';

@Component({
    selector: 'editor-cell',
    template: `
        <div #container class="mood" tabindex="0" (keydown)="onKeyDown($event)">
            <img src="images/smiley.png" (click)="onClick(true)" [ngClass]="{'selected' : happy, 'default' : !happy}">
            <img src="images/smiley-sad.png" (click)="onClick(false)" [ngClass]="{'selected' : !happy, 'default' : happy}">
        </div>
    `,
    styles: [`
        .mood {
            border-radius: 15px;
            border: 1px solid grey;
            background: #e6e6e6;
            padding: 15px;
            text-align:center;
            display:inline-block;
            outline:none
        }

        .default {
            padding-left:10px;
            padding-right:10px;
            border: 1px solid transparent;
            padding: 4px;
        }

        .selected {
            padding-left:10px;
            padding-right:10px;
            border: 1px solid lightgreen;
            padding: 4px;
        }
    `]
})
export class MoodEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    private params: any;

    @ViewChild('container', {read: ViewContainerRef}) public container;
    public happy: boolean = false;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.container.element.nativeElement.focus();
    }

    agInit(params: any): void {
        this.params = params;
        this.setHappy(params.value === "Happy");
    }

    getValue(): any {
        return this.happy ? "Happy" : "Sad";
    }

    isPopup(): boolean {
        return true;
    }

    setHappy(happy: boolean): void {
        this.happy = happy;
    }

    toggleMood(): void {
        this.setHappy(!this.happy);
    }

    onClick(happy:boolean) {
        this.setHappy(happy);
        this.params.api.stopEditing();
    }

    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}