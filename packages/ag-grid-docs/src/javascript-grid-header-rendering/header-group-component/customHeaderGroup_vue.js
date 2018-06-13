import Vue from "vue";

export default Vue.extend({
    template: `
        <div class="ag-header-group-cell-label">
            <div class="customHeaderLabel">{{params.displayName}}</div>
            <div class="customExpandButton" :class="{expanded : groupExpanded, collapsed : !groupExpanded}" v-on:click="expandOrCollapse"><i class="fa fa-arrow-right"></i></div>
        </div>
    `,
    data: function () {
        return {
            groupExpanded: false
        };
    },
    beforeMount() {
    },
    mounted() {
        this.params.columnGroup.getOriginalColumnGroup().addEventListener('expandedChanged', this.syncExpandButtons.bind(this));

        this.syncExpandButtons();
    },
    methods: {
        expandOrCollapse() {
            let currentState = this.params.columnGroup.getOriginalColumnGroup().isExpanded();
            this.params.setExpanded(!currentState);
        },
        syncExpandButtons() {
            this.groupExpanded = this.params.columnGroup.getOriginalColumnGroup().isExpanded();
        }
    }
});