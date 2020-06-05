import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="custom-tooltip">
                <p><span>Athletes Name:</span></p>
                <p><span>{{athlete}}</span></p>
            </div>
    `,
    data: function () {
        return {
            athlete: null
        };
    },
    beforeMount() {
        var valueToDisplay = this.params.value.value ? this.params.value.value : '- Missing -';
        this.setState({
            athlete: valueToDisplay
        });
    },
    methods: {
        setState(obj) {
            Object.assign(this, obj);
        }
    }
});
