import { Component, ViewChildren } from "@angular/core";
import { ICellEditorAngularComp } from "@ag-grid-community/angular";
import { MatRadioButton } from "@angular/material/radio";
import { ICellEditorParams } from "@ag-grid-community/core";

@Component({
    selector: "radio-cell",
    template: `
        <mat-card>
        <div class="container" tabindex="0" (keydown)="onKeyDown($event)">
            <mat-radio-group class="radio-group" [(ngModel)]="favouriteFruit">
                <mat-radio-button class="radio-button" *ngFor="let fruit of fruits" [value]="fruit">
                    {{fruit}}
                </mat-radio-button>
            </mat-radio-group>
        </div>
        </mat-card>
    `,
    styles: [
        `
            .container {
                width: 350px;
            }

            .radio-group {
                display: inline-flex;
                flex-direction: column;
            }

            .radio-button {
                margin: 5px;
            }

            ::ng-deep
            .mat-radio-container .mat-ripple-element {
                opacity: 0.2;
            }
        `
    ]
})
export class MatRadioComponent implements ICellEditorAngularComp {
    private params!: ICellEditorParams & { fruits: string[] };

    public fruits!: string[];
    public favouriteFruit!: string;
    private selectedIndex!: number;

    @ViewChildren(MatRadioButton) public fruitRadios: any;

    agInit(params: ICellEditorParams & { fruits: string[] }): void {
        this.params = params;

        this.favouriteFruit = this.params.value;
        this.fruits = this.params.fruits;

        this.selectedIndex = this.fruits.findIndex(item => {
            return item === this.params.value;
        });
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        this.selectFavouriteFruitBasedOnSelectedIndex();
    }

    private selectFavouriteFruitBasedOnSelectedIndex() {
        this.favouriteFruit = this.fruits[this.selectedIndex];

        // focus on next tick
        const fruitRadio = this.fruitRadios.find((radio: any) => radio.value === this.favouriteFruit);
        window.setTimeout(() => {
            fruitRadio._inputElement.nativeElement.focus();
        }, 0);
    }

    getValue() {
        return this.favouriteFruit;
    }

    isPopup(): boolean {
        return true;
    }

    /*
     * A little over complicated for what it is, but the idea is to illustrate how you might navigate through the radio
     * buttons with up & down keys (instead of finishing editing)
     */
    onKeyDown(event: any): void {
        const key = event.key;
        if (key === 'ArrowUp' || key === 'ArrowDown') {
            this.preventDefaultAndPropagation(event);

            if (key == 'ArrowUp') {
                // up
                this.selectedIndex = this.selectedIndex === 0 ? this.fruits.length - 1 : this.selectedIndex - 1;
            } else if (key == 'ArrowDown') {
                // down
                this.selectedIndex = this.selectedIndex === this.fruits.length - 1 ? 0 : this.selectedIndex + 1;
            }
            this.selectFavouriteFruitBasedOnSelectedIndex();
        }
    }

    private preventDefaultAndPropagation(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }
}
