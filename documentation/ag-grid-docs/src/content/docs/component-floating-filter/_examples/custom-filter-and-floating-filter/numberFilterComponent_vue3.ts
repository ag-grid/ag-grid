export default {
    template: `
      <div style="padding: 4px">
          <div style="font-weight: bold;">Greater than:</div>
          <div>
            <input style="margin: 4px 0 4px 0;" type="number" min="0" v-model="filterText" placeholder="Number of medals..."/>
          </div>
      </div>
    `,
    data: function () {
        return {
            filterText: '',
        };
    },
    watch: {
        filterText(newFilterText) {
            this.params.onModelChange(newFilterText === '' ? null : Number(newFilterText));
        },
    },
    methods: {
        refresh(params) {
            // if the update is from the floating filter, we don't need to update the UI
            if (params.source !== 'ui') {
                this.filterText = String(params.model ?? '');
            }
            return true;
        },
    },
    mounted: function () {
        this.refresh(this.params);
    },
};
