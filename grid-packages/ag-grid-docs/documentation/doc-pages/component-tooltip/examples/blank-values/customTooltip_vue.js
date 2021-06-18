export default {
    template: `
      <div class="custom-tooltip">
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
        this.athlete = this.params.value.value || '- Missing -'
    }
};
