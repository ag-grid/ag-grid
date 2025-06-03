export default {
    template: `
      <div>
          <div class="year-filter">
            <label>
              <input type="radio" value="false" v-model="isActive" v-on:change="toggleFilter(false)"/> All
            </label>
            <label>
              <input type="radio" value="true" v-model="isActive" v-on:change="toggleFilter(true)"/> After 2010
            </label>
          </div>
      </div>
    `,
    data: function () {
        return {
            isActive: false,
        };
    },
    methods: {
        toggleFilter(isFilterActive) {
            this.isActive = isFilterActive;
            this.params.onModelChange(isFilterActive || null);
        },

        refresh(params) {
            // if the update is from the floating filter, we don't need to update the UI
            if (params.source !== 'ui') {
                this.isActive = !!params.model;
            }
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
};
