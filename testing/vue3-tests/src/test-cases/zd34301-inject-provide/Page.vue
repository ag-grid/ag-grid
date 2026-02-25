<script setup>
import { ref } from 'vue';

import WrappedOne from './WrappedOne.vue';
import WrappedTwo from './WrappedTwo.vue';

const isMounted = ref(true);

function unmount() {
    isMounted.value = false;
}

function mount() {
    isMounted.value = true;
}
</script>

<template>
    <button id="unmount" type="button" @click="unmount">Unmount table</button>
    <button id="mount" type="button" @click="mount">Mount table</button>
    <WrappedOne v-if="isMounted" />
    <WrappedTwo v-if="isMounted" />
</template>
