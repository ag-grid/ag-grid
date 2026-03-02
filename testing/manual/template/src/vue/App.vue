<template>
    <ag-grid-vue style="height: 100%" :gridOptions="gridOptions" />
</template>

<script setup lang="ts">
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { AgGridVue } from 'ag-grid-vue3';

import { gridOptions } from '../gridOptions';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
</script>
