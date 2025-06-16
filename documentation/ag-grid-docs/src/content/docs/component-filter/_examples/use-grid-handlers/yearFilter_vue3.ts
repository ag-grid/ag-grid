let id = 1;

export default {
    template: `
        <div class="year-filter">
            <div>Select Year Range</div>
            <label>
                <input type="radio" ref="rbAllYears" :name="name" v-model="year" v-on:change="updateFilter()" value="All"/> All
            </label>
            <label>
                <input type="radio" :name="name" v-model="year" v-on:change="updateFilter()" value="lessThan"/> Before 2010
            </label>
            <label>
                <input type="radio" :name="name" v-model="year" v-on:change="updateFilter()" value="greaterThan"/> Since 2010
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
            const type = this.year === 'All' ? undefined : this.year;
            const model = type
                ? {
                      type,
                      filterType: 'number',
                      filter: 2010,
                  }
                : null;
            onStateChange({ model });
            if (!buttons?.includes('apply')) {
                onAction('apply');
            }
        },

        refresh(newParams): boolean {
            const currentValue = this.year === 'All' ? undefined : this.year;
            const newValue = newParams.state.model?.type;
            if (newValue !== currentValue) {
                this.year = newValue ?? 'All';
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
