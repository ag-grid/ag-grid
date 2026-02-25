<script setup>
import { ref } from 'vue';

const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const menuButton = ref();
const filterButton = ref();

const showMenu = () => {
    props.params.showColumnMenu(menuButton.value);
};

const showFilter = () => {
    props.params.showFilter(filterButton.value);
};
</script>

<template>
    <div style="width: 100%; display: flex; gap: 4px; align-items: center">
        {{ params.displayName }}
        <div style="display: flex; align-items: center; margin-left: auto; gap: 8px">
            <button ref="menuButton" style="margin-left: auto" @click="showMenu">Menu</button>
            <button ref="filterButton" style="margin-left: auto" @click="showFilter" title="filter">Filter</button>
        </div>
    </div>
</template>
