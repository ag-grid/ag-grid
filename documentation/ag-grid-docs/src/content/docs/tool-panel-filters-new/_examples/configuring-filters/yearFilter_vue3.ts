let id = 1;

export default {
    template: `
        <div class="year-filter">
            <div>Select Year Range</div>
            <label>
                <input type="radio" ref="rbAllYears" :name="name" v-model="year" v-on:change="updateFilter()" value="All"/> All
            </label>
            <label>
                <input type="radio" :name="name" v-model="year" v-on:change="updateFilter()" value="2010"/> Since 2010
            </label>
        </div>
    `,
    data: function () {
        return {
            year: 'All',
            // name needs to be unique within the DOM.
            // e.g. if filter is on multiple columns and open simultaneously in filter tool panel
            name: `year${id++}`,
        };
    },
    methods: {
        updateFilter() {
            const { onStateChange, onAction, buttons } = this.params;
            onStateChange({ model: this.year === '2010' || null });
            if (!buttons?.includes('apply')) {
                onAction('apply');
            }
        },

        refresh(newParams): boolean {
            const currentValue = this.year === '2010' || null;
            const newValue = newParams.state.model;
            if (newValue !== currentValue) {
                this.year = newValue ? '2010' : 'All';
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
    mounted: function () {
        this.refresh(this.params);
    },
};
