import Vue from "vue";

export default Vue.extend({
    template: `<span>{{displayValue}}</span>`,
    data: function () {
        return {
            displayValue: ''
        };
    },
    beforeMount() {
        this.displayValue = new Array(this.params.value).fill('#').join('');
    },
});
