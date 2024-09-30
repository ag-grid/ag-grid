import type { IDateComp, IDateParams } from 'ag-grid-community';

// we'll be using the globally provided flatpickr for our example
declare let flatpickr: any;

export class CustomDateComponent implements IDateComp {
    params!: IDateParams;
    eGui!: HTMLDivElement;
    eInput!: HTMLInputElement;
    picker: any;
    date: any;
    init(params: IDateParams) {
        const template = `
            <input type="text" data-input style="width: 100%;" />
            <a class="input-button" title="clear" data-clear>
                <i class="fa fa-times"></i>
            </a>`;

        this.params = params;

        this.eGui = document.createElement('div');
        this.eGui.setAttribute('role', 'presentation');
        this.eGui.classList.add('ag-input-wrapper');
        this.eGui.classList.add('custom-date-filter');
        this.eGui.innerHTML = template;

        this.eInput = this.eGui.querySelector('input')!;

        this.picker = flatpickr(this.eGui, {
            onChange: this.onDateChanged.bind(this),
            dateFormat: 'd/m/Y',
            wrap: true,
        });

        this.picker.calendarContainer.classList.add('ag-custom-component-popup');

        this.date = null;
    }

    getGui() {
        return this.eGui;
    }

    onDateChanged(selectedDates: any) {
        this.date = selectedDates[0] || null;
        this.params.onDateChanged();
    }

    getDate() {
        return this.date;
    }

    setDate(date: any) {
        this.picker.setDate(date);
        this.date = date;
    }

    setInputPlaceholder(placeholder: any) {
        this.eInput.setAttribute('placeholder', placeholder);
    }
}
