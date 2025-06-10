export default {
    template: `
      <div class="partial-match-filter">
        <div>Partial Match Filter</div>
        <div>
            <input type="text" ref="eFilterText" v-model="filterText" v-on:keyup="updateFilter($event)" />
        </div>
      </div>
    `,
    data: function () {
        return {
            filterText: null,
        };
    },
    methods: {
        updateFilter() {
            this.params.onModelChange(this.filterText == null || this.filterText === '' ? null : this.filterText);
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
