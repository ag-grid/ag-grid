export default {
    template: `
      <div class="partial-match-filter">
        <div>Partial Match Filter</div>
        <div>
            <input type="text" ref="eFilterText" v-model="filterText" v-on:input="updateFilter($event)" />
        </div>
      </div>
    `,
    data: function () {
        return {
            filterText: null,
        };
    },
    methods: {
        updateFilter(event) {
            const value = event?.target?.value;
            this.params.onModelChange(value == null || value === '' ? null : value);
        },

        refresh(newParams): boolean {
            const currentValue = this.filterText;
            const newValue = newParams.model ?? '';
            if (newValue !== currentValue) {
                this.filterText = newValue;
            }
            return true;
        },

        afterGuiAttached(params) {
            if (!params || !params.suppressFocus) {
                // focus the input element for keyboard navigation
                this.$refs.eFilterText.focus();
            }
        },

        componentMethod(message) {
            console.log(`Alert from PartialMatchFilterComponent ${message}`);
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
};
