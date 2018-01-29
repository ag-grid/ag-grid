<template>
    <svg viewBox="0 0 300 100" preserveAspectRatio="none">
        <rect x="0" y="0" :width="topRatio * 300" height="50" rx="4" ry="4" class="topBar"/>
        <rect x="0" y="50" :width="bottomRatio * 300" height="50" rx="4" ry="4" class="bottomBar"/>
    </svg>
</template>

<script>
    import Vue from "vue";

    export default Vue.extend({
        props: {
            topRatio: {
                type: Number,
                default: 0.67
            },
            bottomRatio: {
                type: Number,
                default: 0.50
            }
        }
    });
</script>

<style scoped>
    svg {
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .topBar {
        fill: #ff9933;
    }

    .bottomBar {
        fill: #6699ff;
    }
</style>
