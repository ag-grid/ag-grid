import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="custom-tooltip">
                <p><span>Athlete's Name:</span></p>
                <p><span>{{athlete}}</span></p>
            </div>
    `,
    data: function() {
        return {
            athlete: null
        };
    },
    beforeMount() {
        this.setState({
            athlete: this.params.value.value || '- Missing -'
        });
    },
    methods: {
        setState(obj) {
            const that = this;

            Object.keys(obj).forEach(function(key) { that[key] = obj[key]; });
        }
    }
});
