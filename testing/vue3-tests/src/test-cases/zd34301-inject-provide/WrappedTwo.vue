<script setup>
import { provide } from 'vue';

import DemoTable from './DemoTable.vue';

provide('someValue', 'two');
</script>

<template>
    <DemoTable />
</template>
