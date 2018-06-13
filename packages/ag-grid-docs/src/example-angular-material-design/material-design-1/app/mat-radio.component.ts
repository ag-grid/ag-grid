import { Component, ViewChildren } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular/main";
import { MatRadioButton } from "@angular/material";

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
        `
    ]
})
export class MatRadioComponent implements ICellEditorAngularComp {
    private params: any;

    private fruits: string[];
    private favouriteFruit: string;
    private selectedIndex: number;

    @ViewChildren(MatRadioButton) public fruitRadios;

    agInit(params: any): void {
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
        let fruitRadio = this.fruitRadios.find(radio => radio.value === this.favouriteFruit);
        setTimeout(() => {
            fruitRadio.focus();
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
    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key === 38 || key === 40) {
            this.preventDefaultAndPropagation(event);

            if (key == 38) {
                // up
                this.selectedIndex = this.selectedIndex === 0 ? this.fruits.length - 1 : this.selectedIndex - 1;
            } else if (key == 40) {
                // down
                this.selectedIndex = this.selectedIndex === this.fruits.length - 1 ? 0 : this.selectedIndex + 1;
            }
            this.selectFavouriteFruitBasedOnSelectedIndex();
        }
    }

    private preventDefaultAndPropagation(event) {
        event.preventDefault();
        event.stopPropagation();
    }
}