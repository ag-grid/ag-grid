<script setup>
import { provide } from 'vue';

import DemoTable from './DemoTable.vue';

provide('someValue', 'one');
</script>

<template>
    <DemoTable />
</template>
