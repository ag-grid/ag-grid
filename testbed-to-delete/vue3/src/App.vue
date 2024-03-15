<template>
  <div style="height: 100%">
    <ag-grid-vue
        style="width: 100%; height: 500px"
        :class="themeClass"
        :columnDefs="columnDefs"
        :rowData="rowData"
        @grid-ready="onGridReady"
        :defaultColDef="defaultColDef">
    </ag-grid-vue>
  </div>
</template>
<script>
import {ref} from 'vue';
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import {AgGridVue} from "@ag-grid-community/vue3"; // Vue Grid Logic
import {ModuleRegistry} from '@ag-grid-community/core';
import {ClientSideRowModelModule} from '@ag-grid-community/client-side-row-model';
import NumberFloatingFilterComponent from './numberFloatingFilterComponent.js';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

export default {
  components: {
    'ag-grid-vue': AgGridVue,
    NumberFloatingFilterComponent,
  },
  setup(props) {
    const columnDefs = ref([
      {field: 'athlete', filter: false},
      {
        field: 'gold',
        filter: 'agNumberColumnFilter',
        suppressHeaderMenuButton: true,
        floatingFilterComponent: 'NumberFloatingFilterComponent',
        floatingFilterComponentParams: {color: 'gold'},
        suppressFloatingFilterButton: true,
      },
      {
        field: 'silver',
        filter: 'agNumberColumnFilter',
        suppressHeaderMenuButton: true,
        floatingFilterComponent: 'NumberFloatingFilterComponent',
        floatingFilterComponentParams: {color: 'silver'},
        suppressFloatingFilterButton: true,
      },
      {
        field: 'bronze',
        filter: 'agNumberColumnFilter',
        suppressHeaderMenuButton: true,
        floatingFilterComponent: 'NumberFloatingFilterComponent',
        floatingFilterComponentParams: {color: '#CD7F32'},
        suppressFloatingFilterButton: true,
      },
      {
        field: 'total',
        filter: 'agNumberColumnFilter',
        suppressHeaderMenuButton: true,
        floatingFilterComponent: 'NumberFloatingFilterComponent',
        floatingFilterComponentParams: {color: 'unset'},
        suppressFloatingFilterButton: true,
      },
    ]);
    const gridApi = ref();
    const defaultColDef = ref({
      flex: 1,
      minWidth: 100,
      filter: true,
      floatingFilter: true,
    });
    const rowData = ref(null);

    const onGridReady = (params) => {
      gridApi.value = params.api;

      const updateData = (data) => {
        rowData.value = data;
      };

      fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
          .then((resp) => resp.json())
          .then((data) => updateData(data));
    };

    return {
      columnDefs,
      gridApi,
      defaultColDef,
      rowData,
      onGridReady,
      themeClass: 'ag-theme-quartz',
    };
  }
}
</script>
