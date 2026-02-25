<script>
import { ref } from 'vue';

import { AgGridVue } from 'ag-grid-vue3';

export default {
    name: 'AgGrid',
    components: {
        AgGridVue,
    },
    setup() {
        const rowData = ref([
            { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
            { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
            { make: 'Toyota', model: 'Corolla', price: 29600, electric: false },
        ]);

        const colDefs = ref([{ field: 'make' }, { field: 'model' }, { field: 'price' }, { field: 'electric' }]);

        return {
            rowData,
            colDefs,
        };
    },
};
</script>

<template>
    <ag-grid-vue v-model="rowData" :columnDefs="colDefs" style="height: 500px" class="ag-theme-quartz" theme="legacy" />
</template>
