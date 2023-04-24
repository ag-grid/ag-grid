export default {
    template: `
      <div class="custom-tooltip" v-bind:style="{ backgroundColor: color }">
          <p><span>{{ data.athlete }}</span></p>
          <p><span>Country: </span>{{ data.country }}</p>
          <p><span>Total: </span>{{ data.total }}</p>
      </div>
    `,
    data: function () {
        return {
            color: null,
            athlete: null,
            country: null,
            total: null
        };
    },
    beforeMount() {
        this.data = this.params.api.getDisplayedRowAtIndex(this.params.rowIndex).data;
        this.color = this.params.color || 'white';
    }
};
