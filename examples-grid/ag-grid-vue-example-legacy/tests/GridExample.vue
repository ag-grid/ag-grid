<template>
    <ag-grid-vue style="width: 500px; height: 500px;"
                 class="ag-theme-balham"
                 @grid-ready="onGridReady"
                 :columnDefs="columnDefs"
                 :rowData="rowData"
                 :modules="modules">
    </ag-grid-vue>
</template>

<script>
    import {AllCommunityModules} from "@ag-grid-community/all-modules";
    import {AgGridVue} from "@ag-grid-community/vue";
    import Renderer from './Renderer.vue';
    import Editor from './Editor.vue';

    export default {
        name: 'App',
        data() {
            return {
                columnDefs: null,
                rowData: null,
                api: null,
                modules: AllCommunityModules
            }
        },
        components: {
            AgGridVue,
            Renderer,
            Editor
        },
        beforeMount() {
            this.columnDefs = [
                {field: 'make'},
                {
                    field: 'price',
                    editable: true,
                    cellRendererFramework: 'Renderer',
                    cellEditorFramework: 'Editor'
                }
            ];

            this.rowData = [
                {make: 'Toyota', price: '35000'},
            ];
        },
        methods: {
            onGridReady(params) {
                this.api = params.api;
            }
        }
    }
</script>

<style scoped>
</style>


