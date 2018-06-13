import { Component, ElementRef } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular/main";

@Component({
    selector: "slider-cell",
    template: `
    <mat-card>
        <div class="container" (keydown)="onKeyDown($event)">
            <mat-slider
                    [max]="max"
                    [min]="min"
                    [step]="step"
                    [thumb-label]="thumbLabel"
                    [tick-interval]="tickInterval"
                    [value]="value"
                    [(ngModel)]="value"
            >
            </mat-slider>
        </div>
        </mat-card>
    `,
    styles: [
        `
        .container {
            width: 160px;
            height: 100%;
        }

        /deep/
        .mat-slider-horizontal {
            width: 100px;
        }

        /deep/
        .mat-slider-thumb:focus {
            outline: none;
        }
    `
    ]
})
export class MatSliderComponent implements ICellEditorAngularComp {
    private params: any;

    private max: number;
    private min: number;
    private step: number;
    private thumbLabel: boolean;
    private value: number;

    agInit(params: any): void {
        this.params = params;

        this.max = this.params.max || 100;
        this.min = this.params.min || 0;
        this.step = this.params.step || 1;
        this.thumbLabel = this.params.thumbLabel || false;

        this.value = this.params.value;
    }

    constructor(private elRef: ElementRef) {}

    // don't use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        let sliderThumb = this.elRef.nativeElement.querySelector(".mat-slider-thumb");
        sliderThumb.tabIndex = 0;
        setTimeout(() => {
            sliderThumb.focus();
        });
    }

    getValue() {
        return this.value;
    }

    isPopup(): boolean {
        return true;
    }

    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key === 39 || key === 37) {
            // left/right
            event.stopPropagation();
        }
    }
}