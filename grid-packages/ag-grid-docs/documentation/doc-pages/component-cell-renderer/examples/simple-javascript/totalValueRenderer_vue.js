export default {
    template: `
      <span>
              <span>{{ cellValue }}</span>
              <button @click="buttonClicked()">Push For Total</button>
          </span>
    `,
    data: function () {
        return {
            cellValue: null
        };
    },
    beforeMount() {
        // this.params contains the cell & row information and is made available to this component at creation time
        // see ICellRendererParams below for more details
        this.cellValue = this.getValueToDisplay(this.params);
    },
    methods: {
        // gets called whenever the user gets the cell to refresh
        refresh(params) {
            // set value into cell again
            this.cellValue = this.getValueToDisplay(params);
        },

        buttonClicked() {
            alert(`${this.cellValue} medals won!`)
        },

        getValueToDisplay(params) {
            return params.valueFormatted ? params.valueFormatted : params.value;
        }
    }
};
