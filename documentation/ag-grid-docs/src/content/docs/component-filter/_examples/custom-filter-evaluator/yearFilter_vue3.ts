export default {
    template: `
        <div class="year-filter">
            <div>Select Year Range</div>
            <label>
                <input type="radio" ref="rbAllYears" name="year" v-model="year" v-on:change="updateFilter()" value="All"/> All
            </label>
            <label>
                <input type="radio" name="year" v-model="year" v-on:change="updateFilter()" value="2010"/> Since 2010
            </label>
        </div>
    `,
    data: function () {
        return {
            year: 'All',
        };
    },
    methods: {
        updateFilter() {
            this.params.onStateChange({ model: this.year === '2010' || null });
        },

        refresh(newParams): boolean {
            const currentValue = this.year === '2010' || null;
            const newValue = newParams.model;
            if (newValue !== currentValue) {
                this.year = newValue ? 'All' : '2010';
            }
            return true;
        },

        afterGuiAttached(params) {
            if (!params || !params.suppressFocus) {
                // focus the input element for keyboard navigation
                this.$refs.rbAllYears.focus();
            }
        },
    },
};
