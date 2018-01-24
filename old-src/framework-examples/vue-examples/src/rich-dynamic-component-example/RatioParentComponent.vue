<template>
    <span class="ratioParent" style="height:19px">
        <ag-ratio :topRatio="params.value.top"
                  :bottomRatio="params.value.bottom"></ag-ratio>
    </span>
</template>


<script>
    import Vue from "vue";
    import RatioComponent from "./RatioComponent.vue";

    export default Vue.extend({
        components: {
            'ag-ratio': RatioComponent
        }
    });
</script>

<style scoped>
    .ratioParent {
        display: block;
        overflow: hidden;
        border: 1px solid #ccc;
        border-radius: 6px;
        background: #fff;
    }
</style>