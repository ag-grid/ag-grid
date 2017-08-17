import Vue from "vue";

export default Vue.extend({
    template: '<span>Full Width Column! {{ values }}</span>',
    data() {
        return {
            values: null
        }
    },
    created() {
        this.values = `Name: ${this.params.data.name}, Age: ${this.params.data.age}`;
    }
})


