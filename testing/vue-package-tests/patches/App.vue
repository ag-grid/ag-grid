<script setup lang="ts">
import { ref } from 'vue';

import type { GridOptions } from 'ag-grid-community';
import { AgGridVue } from 'ag-grid-vue3';

// Insert imports.partial here.

// Insert gridOptions.partial here.
</script>

<template>
    <AgGridVue :gridOptions="gridOptions" style="height: 100%; width: 100%" />
</template>

<style scoped></style>
