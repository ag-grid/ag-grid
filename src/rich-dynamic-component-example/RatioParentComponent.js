import Vue from "vue";
import RatioComponent from "./RatioComponent";

export default Vue.extend({
    template: '<span class="ratioParent" style="height:19px"><ag-ratio :topRatio="params.value.top" :bottomRatio="params.value.bottom"></ag-ratio></span>',
    components: {
        'ag-ratio': RatioComponent
    }
});

