export default {
    template:
        `
          <div class="custom-tooltip">
          <div :class="'panel panel-' + type">
            <div class="panel-heading">
              <h3 class="panel-title">{{ country }}</h3>
            </div>
            <div class="panel-body">
              <h4 style="white-space: nowrap;">{{ athlete }}</h4>
              <p>Total: {{ total }}</p>
            </div>
          </div>
          </div>`,
    data: function () {
        return {
            type: null,
            athlete: null,
            country: null,
            total: null
        };
    },
    beforeMount() {
        const data = this.params.api.getDisplayedRowAtIndex(this.params.rowIndex).data;
        this.type = this.params.type || 'primary';
        this.athlete = data.athlete;
        this.country = data.country;
        this.total = data.total;
    }
};
