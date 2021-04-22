[[only-vue]]
|Below is a simple example of filter component:
|
|```js
|const CustomDateComponent = {
|    template: `
|      <div class="ag-input-wrapper custom-date-filter" role="presentation" ref="flatpickr">
|          <input type="text" ref="eInput" data-input style="width: 100%;"/>
|          <a class="input-button" title="clear" data-clear>
|              <i class="fa fa-times"></i>
|          </a>
|      </div>
|    `,
|    data: function () {
|        return {
|            date: null
|        };
|    },
|    beforeMount() {
|    },
|    mounted() {
|        this.picker = flatpickr(this.$refs['flatpickr'], {
|            onChange: this.onDateChanged.bind(this),
|            dateFormat: 'd/m/Y',
|            wrap: true
|        });
|
|        this.eInput = this.$refs['eInput'];
|
|        this.picker.calendarContainer.classList.add('ag-custom-component-popup');
|    },
|    methods: {
|        onDateChanged(selectedDates) {
|            this.date = selectedDates[0] || null;
|            this.params.onDateChanged();
|        },
|
|        getDate() {
|            return this.date;
|        },
|
|        setDate(date) {
|            this.picker.setDate(date);
|            this.date = date || null;
|        },
|
|        setInputPlaceholder(placeholder) {
|            this.eInput.setAttribute('placeholder', placeholder);
|        },
|
|        setInputAriaLabel(label) {
|            this.eInput.setAttribute('aria-label', label);
|        }
|    }
|}
|```
|
|### Custom Filter Parameters
|
|When a Vue component is instantiated the grid will make the grid APIs, a number of utility methods as well as the cell &
|row values available to you via `this.params` - the interface for what is provided is documented below:  
| 
