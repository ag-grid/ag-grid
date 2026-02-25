<template>
    <div class="header_wrapper">
        <h3>&#127775;{{ params.column?.getColDef()?.headerName }}</h3>
    </div>
</template>

<script setup>
defineProps({
    params: {
        type: Object,
        required: true,
    },
});
</script>

<style scoped>
.header_wrapper {
    background: linear-gradient(0deg, rgba(34, 193, 195, 1) 0%, rgba(253, 187, 45, 1) 100%);
    padding: 0.5rem;
}
</style>
