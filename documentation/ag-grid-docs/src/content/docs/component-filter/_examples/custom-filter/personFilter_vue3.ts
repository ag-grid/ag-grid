export default {
    template: `
      <div class="person-filter">
        <div>Custom Athlete Filter</div>
        <div>
            <input type="text" ref="eFilterText" v-model="filterText" v-on:keyup="updateFilter($event)" placeholder="Full name search..."/>
        </div>
        <div>This filter does partial word search on multiple words, eg "mich phel" still brings back Michael Phelps.</div>
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
    },
    mounted: function () {
        this.refresh(this.params);
    },
};
