<script setup>
import { MaIcon, MaTooltip } from '@mobileaction/action-kit';
import '@mobileaction/action-kit/dist/style.css';
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
    <div class="w-full flex gap-1 items-center bg-red-500">
        {{ params.displayName }}
        <ma-tooltip v-if="params.tooltip" type="primary" placement="top">
            <template #title>
                <span v-html="params.tooltip" />
            </template>
            <template #default>
                <ma-icon name="info-circle-2-bold" size="xs" class="flex-none" />
            </template>
        </ma-tooltip>
        <div class="flex items-center ml-auto gap-2 bg-red-500">
            <button ref="menuButton" class="ml-auto" @click="showMenu">
                <ma-icon name="menu" size="xs" />
            </button>
            <ma-tooltip type="primary" placement="top" title="filter">
                <button ref="filterButton" class="ml-auto" @click="showFiler">
                    <ma-icon name="filter" size="xs" />
                </button>
            </ma-tooltip>
        </div>
    </div>
</template>
