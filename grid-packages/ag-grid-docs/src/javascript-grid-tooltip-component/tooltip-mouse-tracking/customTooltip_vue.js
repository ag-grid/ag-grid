import Vue from "vue";

export default Vue.extend({
    template:
        `<div class="custom-tooltip">
            <div :class="'panel panel-' + type">
            <div class="panel-heading">
                <h3 class="panel-title">{{country}}</h3>
            </div>
            <div class="panel-body">
                <h4 style="white-space: nowrap;">{{athlete}}</h4>
                <p>Total: {{total}}</p>
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
        var data = this.params.api.getDisplayedRowAtIndex(this.params.rowIndex).data;
        data.type = this.params.type || 'primary';
        this.setState(data);
    },
    methods: {
        setState(obj) {
            Object.assign(this, obj);
        }
    }
});