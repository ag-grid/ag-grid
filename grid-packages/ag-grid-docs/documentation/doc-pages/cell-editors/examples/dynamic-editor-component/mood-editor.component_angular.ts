import { AfterViewInit, Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ICellEditorAngularComp } from "@ag-grid-community/angular";

@Component({
    selector: 'editor-cell',
    template: `
        <div #container class="mood" tabindex="0" (keydown)="onKeyDown($event)">
            <img src="https://www.ag-grid.com/example-assets/smileys/happy.png" (click)="onClick(true)" [ngClass]="{'selected' : happy, 'default' : !happy}">
            <img src="https://www.ag-grid.com/example-assets/smileys/sad.png" (click)="onClick(false)"
                 [ngClass]="{'selected' : !happy, 'default' : happy}">
        </div>
    `,
    styles: [`
        .mood {
            border-radius: 15px;
            border: 1px solid grey;
            background: #e6e6e6;
            padding: 15px;
            text-align: center;
            display: inline-block;
            outline: none
        }

        .default {
            padding-left: 10px;
            padding-right: 10px;
            border: 1px solid transparent;
            padding: 4px;
        }

        .selected {
            padding-left: 10px;
            padding-right: 10px;
            border: 1px solid lightgreen;
            padding: 4px;
        }
    `]
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
        this.setHappy(params.value === "Happy");
    }

    getValue(): any {
        return this.happy ? "Happy" : "Sad";
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

    onKeyDown(event: KeyboardEvent): void {
        const key = event.key;
        if (key === 'ArrowLeft' ||  // left
            key == 'ArrowRight') {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}
