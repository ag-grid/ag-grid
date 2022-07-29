export default {
    template: `
            <span>
             <span>{{cellValue}}</span>&nbsp;
             <button @click="buttonClicked($event)">Push For Total</button>
        </span>
`,
    data: function () {
        return {
            cellValue: ''
        };
    },
    beforeMount() {
        this.cellValue = this.params.valueFormatted ? this.params.valueFormatted : this.params.value;
    },
    methods: {
        buttonClicked() {
            alert(`${this.cellValue} medals won!`)
        }
    }
};
