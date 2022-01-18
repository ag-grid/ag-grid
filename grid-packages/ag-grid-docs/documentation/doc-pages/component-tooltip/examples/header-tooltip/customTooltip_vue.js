export default {
    template: `
      <div class="custom-tooltip" v-if="isHeader">
          <p>Group Name: {{ params.value }}</p>
          <hr v-if="isGroupedHeader"/>
          <div v-if="isGroupedHeader">
            <p v-for="(header, idx) in params.colDef.children">
              Child {{ (idx + 1) }} - {{ header.headerName }}
            </p>
          </div>
          </div>
          <div class="custom-tooltip" v-else>
          <p><span>Athlete's Name:</span></p>
          <p><span>{{ athlete }}</span></p>
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
