import Vue from "vue";

export default Vue.extend({
    template: "<span>{{ params.value | currency('EUR') }}</span>",
    filters: {
        currency(value, symbol) {
            let result = value;
            if(!isNaN(value)) {
                result = value.toFixed(2);
            }
            return symbol + value;
        }
    }
});

