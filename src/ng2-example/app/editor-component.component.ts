import {Component,ViewContainerRef,ViewChild,AfterViewInit,OnDestroy} from '@angular/core';
import {CommonModule} from "@angular/common"
import {FormsModule} from "@angular/forms"

import {AgRendererComponent} from 'ag-grid-ng2/main';
import {AgEditorComponent} from 'ag-grid-ng2/main';

import {GridOptions} from 'ag-grid/main';

@Component({
    selector: 'editor-cell',
    template: `
        <div #container class="mood" tabindex="0" (keydown)="onKeyDown($event)">
            <img src="../images/smiley.png" (click)="setHappy(true)" [ngClass]="{'selected' : happy, 'default' : !happy}">
            <img src="../images/smiley-sad.png" (click)="setHappy(false)" [ngClass]="{'selected' : !happy, 'default' : happy}">
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
class MoodEditorComponent implements AgEditorComponent, AfterViewInit {
    private params:any;

    @ViewChild('container', {read: ViewContainerRef}) private container;
    private happy:boolean = false;

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.container.element.nativeElement.focus();
    }

    agInit(params:any):void {
        this.params = params;
        this.setHappy(params.value === "Happy");
    }

    getValue():any {
        return this.happy ? "Happy" : "Sad";
    }

    isPopup():boolean {
        return true;
    }

    setHappy(happy:boolean):void {
        this.happy = happy;
    }

    toggleMood():void {
        this.setHappy(!this.happy);
    }

    onKeyDown(event):void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}

@Component({
    selector: 'mood-cell',
    template: `<img width="20px" [src]="imgForMood" />`
})
class MoodRendererComponent implements AgRendererComponent {
    private params:any;
    private mood:string;
    private imgForMood:string;

    agInit(params:any):void {
        this.params = params;
        this.setMood(params);
    }

    refresh(params:any):void {
        this.params = params;
        this.setMood(params);
    }

    private setMood(params) {
        this.mood = params.value;
        this.imgForMood = this.mood === 'Happy' ? '../images/smiley.png' : '../images/smiley-sad.png';
    };
}

@Component({
    selector: 'numeric-cell',
    template: `<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value">`
})
class NumericEditorComponent implements AgEditorComponent, AfterViewInit {
    private params:any;
    private value:number;
    private cancelBeforeStart:boolean = false;

    @ViewChild('input', {read: ViewContainerRef}) private input;


    agInit(params:any):void {
        this.params = params;
        this.value = this.params.value;

        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && ('1234567890'.indexOf(params.charPress) < 0);
    }

    getValue():any {
        return this.value;
    }

    isCancelBeforeStart():boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return this.value > 1000000;
    };

    onKeyDown(event):void {
        if (!this.isKeyPressedNumeric(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.input.element.nativeElement.focus();
    }

    private getCharCodeFromEvent(event):any {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    private isCharNumeric(charStr):boolean {
        return !!/\d/.test(charStr);
    }

    private isKeyPressedNumeric(event):boolean {
        var charCode = this.getCharCodeFromEvent(event);
        var charStr = String.fromCharCode(charCode);
        return this.isCharNumeric(charStr);
    }
}

@Component({
    selector: 'ag-editor-component',
    templateUrl: 'app/editor-component.component.html'
})
export class EditorComponent {
    private gridOptions:GridOptions;

    constructor() {
        this.gridOptions = <GridOptions>{};
        this.gridOptions.rowData = this.createRowData();
        this.gridOptions.columnDefs = this.createColumnDefs();
    }

    private createColumnDefs() {
        return [
            {headerName: "Name", field: "name", width: 198},
            {
                headerName: "Mood",
                field: "mood",
                cellRendererFramework: {
                    component: MoodRendererComponent
                },
                cellEditorFramework: {
                    component: MoodEditorComponent,
                    moduleImports: [CommonModule]
                },
                editable: true,
                width: 150
            },
            {
                headerName: "Numeric",
                field: "number",
                cellEditorFramework: {
                    component: NumericEditorComponent,
                    moduleImports: [FormsModule]
                },
                editable: true,
                width: 150
            }
        ];
    }

    private createRowData() {
        return [
            {name: "Bob", happy: "Happy", number: 10},
            {name: "Harry", happy: "Sad", number: 3},
            {name: "Sally", happy: "Happy", number: 20},
            {name: "Mary", mood: "Sad", number: 5},
            {name: "John", mood: "Happy", number: 15},
        ];
    }
}