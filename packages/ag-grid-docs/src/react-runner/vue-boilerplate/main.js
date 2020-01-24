import Vue from "vue";
import {AgChartsVue} from "ag-charts-vue";

const VueExample = {
    template: '<ag-charts-vue :options="options"></ag-charts-vue>',
    components: {
        "ag-charts-vue": AgChartsVue
    },
    data: function () {
        return {
            options: {}
        };
    },
    beforeMount() {
        this.options = $OPTIONS$;
    },
};

new Vue({
    el: "#app",
    components: {
        "my-component": VueExample
    }
});
