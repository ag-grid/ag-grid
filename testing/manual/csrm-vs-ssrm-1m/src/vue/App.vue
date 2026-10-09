<template>
    <ag-grid-vue style="height: 100%" :gridOptions="gridOptions" />
</template>

<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';

import { gridOptions } from '../config';
</script>
