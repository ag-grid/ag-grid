import Vue from "vue";

export default Vue.extend({
    template: `
            <div class="custom-tooltip">
                <p><span>{{athlete}}</span></p>
                <p><span>Country: </span>{{country}}</p>
                <p><span>Total: </span>{{total}}</p>
            </div>
    `,
    data: function () {
        return {
            color: null,
            athlete: null,
            country: null,
            total: null
        };
    },
    beforeMount() {
        var data = this.params.api.getDisplayedRowAtIndex(this.params.rowIndex).data;
        data.color = this.params.color || 'white';
        this.setState(data);
    },
    mounted() {
        this.$el.style['background-color'] = this.color;
    },
    methods: {
        setState(obj) {
            Object.assign(this, obj);
        }
    }
});