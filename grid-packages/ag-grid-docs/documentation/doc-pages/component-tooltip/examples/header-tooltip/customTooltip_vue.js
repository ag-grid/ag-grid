export default {
  template: `
      <div class="custom-tooltip custom-tooltip-grouped" v-if="isHeader">
          <span>Group Name: {{ params.value }}</span>
          <span v-if="isGroupedHeader" v-for="(header, idx) in params.colDef.children">
            Child {{ (idx + 1) }} - {{ header.headerName }}
          </span>
        </div>
        <div class="custom-tooltip" v-else>
          <span>Athlete's Name:</span>
          <span>{{ athlete }}</span>
      </div>
    `,
  data: function () {
    return {
      athlete: null
    };
  },
  beforeMount() {
    const params = this.params;
    this.athlete = params.value.value ? params.value.value : '- Missing -';
    this.isHeader = params.rowIndex === undefined;
    this.isGroupedHeader = !!params.colDef.children;
  }
};
