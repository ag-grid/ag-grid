<template>
    <div id="app">
        <!--<rich-grid-example></rich-grid-example>-->
        <!--<dynamic-components-example></dynamic-components-example>-->
        <!--<rich-dynamic-components-example></rich-dynamic-components-example>-->
        <!--<editor-components-example></editor-components-example>-->
        <!--<floating-row-example></floating-row-example>-->
        <full-width-row-example></full-width-row-example>
    </div>
</template>

<script>
    import Vue from "vue";
    import RichGridExample from './rich-grid-example/RichGridExample.vue'
    import DynamicComponentExample from './dynamic-component-example/DynamicComponentExample.vue'
    import RichDynamicComponentExample from './rich-dynamic-component-example/RichDynamicComponentExample.vue'
    import EditorComponentExample from './editor-component-example/EditorComponentExample.vue'
    import FloatingRowExample from './floating-row-example/FloatingRowExample.vue'
    import FullWidthRowExample from './full-width-example/FullWidthExample.vue'

    export default {
        components: {
            'rich-grid-example': RichGridExample,
            'dynamic-components-example': DynamicComponentExample,
            'rich-dynamic-components-example': RichDynamicComponentExample,
            'editor-components-example': EditorComponentExample,
            'floating-row-example': FloatingRowExample,
            'full-width-row-example': FullWidthRowExample,
        }
    }
</script>

<style>
</style>
