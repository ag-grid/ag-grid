import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="ag-name-value">
                    <span>Row Count Component&nbsp;:</span>
                    <span class="ag-name-value-value">{{count}}</span>
                </div>
            </div>
    `,
    data: function () {
        return {
            count: null
        };
    },
    beforeMount() {
    },
    mounted() {
        this.params.api.addEventListener('gridReady', this.onGridReady.bind(this));
    },
    methods: {
        onGridReady(params) {
            this.count = this.params.api.getModel().rowsToDisplay.length;
        }
    }
});
