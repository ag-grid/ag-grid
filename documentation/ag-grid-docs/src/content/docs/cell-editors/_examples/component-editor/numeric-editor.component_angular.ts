import { AfterViewInit, Component, ViewChild, ViewContainerRef } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { ICellEditorParams } from "@ag-grid-community/core";

// backspace starts the editor on Windows
const KEY_BACKSPACE = 'Backspace';
const KEY_F2 = 'F2';
const KEY_ENTER = 'Enter';
const KEY_TAB = 'Tab';

@Component({
    standalone: true,
    imports: [FormsModule],
    template: `<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value" class="numeric-input">`
})
export class NumericEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;
    public value!: string;
    public highlightAllOnFocus = true;
    private cancelBeforeStart = false;

    @ViewChild('input', { read: ViewContainerRef }) public input!: ViewContainerRef;


    agInit(params: ICellEditorParams): void {
        this.params = params;
        this.setInitialState(this.params);

        // only start edit if key pressed is a number, not a letter
        const eventKey = params.eventKey;
        this.cancelBeforeStart = !!(eventKey && eventKey.length === 1 && ('1234567890'.indexOf(eventKey) < 0));
    }

    setInitialState(params: ICellEditorParams) {
        let startValue;
        let highlightAllOnFocus = true;
        const eventKey = params.eventKey;

        if (eventKey === KEY_BACKSPACE) {
            // if backspace or delete pressed, we clear the cell
            startValue = '';
        } else if (eventKey && eventKey.length === 1) {
            // if a letter was pressed, we start with the letter
            startValue = eventKey;
            highlightAllOnFocus = false;
        } else {
            // otherwise we start with the current value
            startValue = params.value;
            if (params.eventKey === KEY_F2) {
                highlightAllOnFocus = false;
            }
        }

        this.value = startValue;
        this.highlightAllOnFocus = highlightAllOnFocus;
    }

    getValue(): number | null {
        const value = this.value;
        return value === '' || value == null ? null : parseInt(value);
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        const value = this.getValue();
        return value != null && value > 1000000;
    }

    onKeyDown(event: any): void {
        if (this.isLeftOrRight(event) || this.isBackspace(event)) {
            event.stopPropagation();
            return;
        }

        if (!this.finishedEditingPressed(event) && !this.isNumericKey(event)) {
            if (event.preventDefault) event.preventDefault();
        }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            this.input.element.nativeElement.focus();
            if (this.highlightAllOnFocus) {
                this.input.element.nativeElement.select();

                this.highlightAllOnFocus = false;
            } else {
                // when we started editing, we want the caret at the end, not the start.
                // this comes into play in two scenarios: 
                //   a) when user hits F2 
                //   b) when user hits a printable character
                const length = this.input.element.nativeElement.value ? this.input.element.nativeElement.value.length : 0;
                if (length > 0) {
                    this.input.element.nativeElement.setSelectionRange(length, length);
                }
            }

            this.input.element.nativeElement.focus();
        })
    }

    private isCharNumeric(charStr: string): boolean {
        return !!/\d/.test(charStr);
    }

    private isNumericKey(event: any): boolean {
        const charStr = event.key;
        return this.isCharNumeric(charStr);
    }

    private isBackspace(event: any) {
        return event.key === KEY_BACKSPACE;
    }

    private isLeftOrRight(event: any) {
        return ['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1;
    }

    private finishedEditingPressed(event: any) {
        const key = event.key;
        return key === KEY_ENTER || key === KEY_TAB;
    }
}
