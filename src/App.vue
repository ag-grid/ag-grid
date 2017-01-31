<template>
    <div id="app">
        <rich-grid-example></rich-grid-example>
        <dynamic-components-example></dynamic-components-example>
    </div>
</template>

<script>
    import Vue from "vue";
    import RichGridExample from './rich-grid-example/RichGridExample.vue'
    import DynamicComponentExample from './dynamic-component-example/DynamicComponentExample.vue'

    export default {
        components: {
            'rich-grid-example': RichGridExample,
            'dynamic-components-example': DynamicComponentExample
        }
    }
</script>

<style>
</style>
