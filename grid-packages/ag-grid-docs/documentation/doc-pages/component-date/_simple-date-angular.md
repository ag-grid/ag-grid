<framework-specific-section frameworks="angular">
|Below is an example of a date component class:
</framework-specific-section>

<framework-specific-section frameworks="angular">
<snippet transform={false}>
|import {Component, ElementRef, ViewChild} from '@angular/core';
|
|import {IDateParams} from 'ag-grid-community';
|import {IDateAngularComp} from 'ag-grid-angular';
|
|// we'll be using the globally provided flatpickr for our example
|declare var flatpickr : any;
|
|@Component({
|    selector: 'app-custom-date',
|    template: `
|      &lt;div #flatpickrEl class="ag-input-wrapper custom-date-filter" role="presentation">
|      &lt;input type="text" #eInput data-input style="width: 100%;"/>
|      &lt;a class='input-button' title='clear' data-clear>
|        &lt;i class='fa fa-times'>&lt;/i>
|      &lt;/a>
|      &lt;/div>
|    `,
|    styles: [        `
|            .custom-date-filter a {
|                position: absolute;
|                right: 20px;
|                color: rgba(0, 0, 0, 0.54);
|                cursor: pointer;
|            }
|
|            .custom-date-filter:after {
|                position: absolute;
|                content: '073';
|                display: block;
|                font-weight: 400;
|                font-family: 'Font Awesome 5 Free';
|                right: 5px;
|                pointer-events: none;
|                color: rgba(0, 0, 0, 0.54);
|            }
|        `
|    ]
|})
|export class CustomDateComponent implements IDateAngularComp {
|    @ViewChild("flatpickrEl", {read: ElementRef}) flatpickrEl: ElementRef;
|    @ViewChild("eInput", {read: ElementRef}) eInput: ElementRef;
|    private date: Date;
|    private params: IDateParams;
|    private picker: any;
|
|    agInit(params: IDateParams): void {
|        this.params = params;
|    }
|
|    ngAfterViewInit(): void {
|        this.picker = flatpickr(this.flatpickrEl.nativeElement, {
|            onChange: this.onDateChanged.bind(this),
|            wrap: true
|        });
|
|        this.picker.calendarContainer.classList.add('ag-custom-component-popup');
|    }
|
|    ngOnDestroy() {
|        console.log(`Destroying DateComponent`);
|    }
|
|    onDateChanged(selectedDates: any) {
|        this.date = selectedDates[0] || null;
|        this.params.onDateChanged();
|    }
|
|    getDate(): Date {
|        return this.date;
|    }
|
|    setDate(date: Date): void {
|        this.date = date || null;
|        this.picker.setDate(date);
|    }
|
|    setInputPlaceholder(placeholder: string): void {
|        this.eInput.nativeElement.setAttribute('placeholder', placeholder);
|    }
|
|    setInputAriaLabel(label: string): void {
|        this.eInput.nativeElement.setAttribute('aria-label', label);
|    }
|}
</snippet>
</framework-specific-section>
