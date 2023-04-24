import { Component, ElementRef, ViewChild } from '@angular/core';

import { IDateParams } from '@ag-grid-community/core';
import { IDateAngularComp } from '@ag-grid-community/angular';

// we'll be using the globally provided flatpickr for our example
declare var flatpickr: any;

@Component({
    selector: 'app-loading-overlay',
    template: `
      <div #flatpickrEl class="ag-input-wrapper custom-date-filter" role="presentation">
      <input type="text" #eInput data-input style="width: 100%;"/>
      <a class='input-button' title='clear' data-clear>
        <i class='fa fa-times'></i>
      </a>
      </div>
    `,
    styles: [`
            .custom-date-filter a {
                position: absolute;
                right: 20px;
                color: rgba(0, 0, 0, 0.54);
                cursor: pointer;
            }

            .custom-date-filter:after {
                position: absolute;
                content: '\f073';
                display: block;
                font-weight: 400;
                font-family: 'Font Awesome 5 Free';
                right: 5px;
                pointer-events: none;
                color: rgba(0, 0, 0, 0.54);
            }
        `
    ]
})
export class CustomDateComponent implements IDateAngularComp {
    @ViewChild("flatpickrEl", { read: ElementRef }) flatpickrEl!: ElementRef;
    @ViewChild("eInput", { read: ElementRef }) eInput!: ElementRef;
    private date!: Date;
    private params!: IDateParams;
    private picker: any;

    agInit(params: IDateParams): void {
        this.params = params;
    }

    ngAfterViewInit(): void {
        this.picker = flatpickr(this.flatpickrEl.nativeElement, {
            onChange: this.onDateChanged.bind(this),
            dateFormat: 'd/m/Y',
            wrap: true
        });

        this.picker.calendarContainer.classList.add('ag-custom-component-popup');
    }

    ngOnDestroy() {
        console.log(`Destroying DateComponent`);
    }

    onDateChanged(selectedDates: any) {
        this.date = selectedDates[0] || null;
        this.params.onDateChanged();
    }

    getDate(): Date {
        return this.date;
    }

    setDate(date: Date): void {
        this.date = date || null;
        this.picker.setDate(date);
    }

    setInputPlaceholder(placeholder: string): void {
        this.eInput.nativeElement.setAttribute('placeholder', placeholder);
    }

    setInputAriaLabel(label: string): void {
        this.eInput.nativeElement.setAttribute('aria-label', label);
    }
}
