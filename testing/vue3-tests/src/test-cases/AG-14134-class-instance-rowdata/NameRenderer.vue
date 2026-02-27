<template>
    <div>
        <span aria-label="cell-value">{{ instance.name }}-{{ instance.formattedName }}-{{ isMission }}</span>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    params: {
        type: Object,
        required: true,
    },
});

const instance = props.params.data;
const isMission = ref(props.params.data.constructor.name === 'Mission');
</script>
