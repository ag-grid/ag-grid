import { defineComponent, markRaw } from 'vue';
import type { PropType } from 'vue';

import type { IDateParams } from 'ag-grid-community';

// we'll be using the globally provided flatpickr for our example
declare let flatpickr: any;

interface FlatpickrInstance {
    calendarContainer: HTMLElement;
    setDate(date: Date | null): void;
}

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IDateParams>,
            required: true,
        },
    },
    template: `
      <div class="ag-input-wrapper custom-date-filter" role="presentation" ref="flatpickr">
      <input type="text" ref="eInput" data-input style="width: 100%;"/>
      <a class="input-button" title="clear" data-clear>
        <i class="fa fa-times"></i>
      </a>
      </div>
    `,
    data: function () {
        return {
            date: null as Date | null,
            ariaLabel: undefined as string | undefined,
            picker: null as FlatpickrInstance | null,
            eInput: null as HTMLInputElement | null,
        };
    },
    mounted() {
        const picker: FlatpickrInstance = markRaw(
            flatpickr(this.$refs['flatpickr'], {
                onChange: this.onDateChanged.bind(this),
                dateFormat: 'd/m/Y',
                wrap: true,
            })
        );
        this.picker = picker;

        const eInput = this.$refs['eInput'] as HTMLInputElement;
        this.eInput = eInput;

        picker.calendarContainer.classList.add('ag-custom-component-popup');

        if (this.ariaLabel) {
            eInput.setAttribute('aria-label', this.ariaLabel);
        }
    },
    methods: {
        onDateChanged(selectedDates: Date[]) {
            this.date = selectedDates[0] || null;
            this.params.onDateChanged();
        },

        getDate(): Date | null {
            return this.date;
        },

        setDate(date: Date | null) {
            this.picker!.setDate(date);
            this.date = date || null;
        },

        setInputPlaceholder(placeholder: string) {
            this.eInput!.setAttribute('placeholder', placeholder);
        },

        setInputAriaLabel(label: string) {
            if (this.eInput) {
                this.eInput.setAttribute('aria-label', label);
            } else {
                this.ariaLabel = label;
            }
        },
    },
});
