import { Component, QueryList, ViewChildren, ViewContainerRef } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular/main";

@Component({
    selector: "input-cell",
    template: `
        <mat-card>
        <form class="container" tabindex="0" (keydown)="onKeyDown($event)">
            <mat-form-field class="example-full-width">
                <input #input matInput [(ngModel)]="firstName" placeholder="First name"
                       [ngModelOptions]="{standalone: true}">
            </mat-form-field>
            <mat-form-field class="example-full-width">
                <input #input matInput [(ngModel)]="lastName" placeholder="Last Name"
                       [ngModelOptions]="{standalone: true}">
            </mat-form-field>
        </form>
        </mat-card>
    `,
    styles: [
        `
            .container {
                width: 350px;
            }
        `
    ]
})
export class MatInputComponent implements ICellEditorAngularComp {
    private params: any;

    private firstName: string;
    private lastName: string;

    @ViewChildren("input", { read: ViewContainerRef })
    public inputs: QueryList<any>;
    private focusedInput: number = 0;

    agInit(params: any): void {
        this.params = params;

        // simple implementation - we assume a full name consists of a first and last name only
        this.firstName = this.params.value.split(" ")[0];
        this.lastName = this.params.value.split(" ")[1];
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.focusOnInputNextTick(this.inputs.first);
    }

    private focusOnInputNextTick(input: ViewContainerRef) {
        setTimeout(() => {
            input.element.nativeElement.focus();
        }, 0);
    }

    getValue() {
        return `${this.firstName} ${this.lastName}`;
    }

    isPopup(): boolean {
        return true;
    }

    /*
     * A little over complicated for what it is, but the idea is to illustrate how you might tab between multiple inputs
     * say for example in full row editing
     */
    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key == 9) {
            // tab
            this.preventDefaultAndPropagation(event);

            // either move one input along, or cycle back to 0
            this.focusedInput = this.focusedInput === this.inputs.length - 1 ? 0 : this.focusedInput + 1;

            let focusedInput = this.focusedInput;
            let inputToFocusOn = this.inputs.find((item: any, index: number) => {
                return index === focusedInput;
            });

            this.focusOnInputNextTick(inputToFocusOn);
        } else if (key == 13) {
            // enter
            // perform some validation on enter - in this example we assume all inputs are mandatory
            // in a proper application you'd probably want to inform the user that an input is blank
            this.inputs.forEach(input => {
                if (!input.element.nativeElement.value) {
                    this.preventDefaultAndPropagation(event);
                    this.focusOnInputNextTick(input);
                }
            });
        }
    }

    private preventDefaultAndPropagation(event) {
        event.preventDefault();
        event.stopPropagation();
    }
}