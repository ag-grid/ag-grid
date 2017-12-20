<template>
    <div style="width: 800px;">
        <h1>Rich Dynamic Components</h1>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-theme-fresh"
                     :gridOptions="gridOptions"
                     :columnDefs="columnDefs"
                     :rowData="rowData"
                     :enableSorting="true">
        </ag-grid-vue>
    </div>
</template>

<script>
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import RatioParentComponent from './RatioParentComponent.vue'
    import ClickableParentComponent from './ClickableParentComponent'
    import SimpsonsHeaderComponent from './SimponsHeaderComponent.vue'

    export default {
        data () {
            return {
                gridOptions: null,
                columnDefs: null,
                rowData: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        methods: {
            createRowData() {
                this.rowData = [
                    {name: 'Homer Simpson', ratios: {top: 0.25, bottom: 0.75}},
                    {name: 'Marge Simpson', ratios: {top: 0.67, bottom: 0.39}},
                    {name: 'Bart Simpson', ratios: {top: 0.82, bottom: 0.47}},
                    {name: 'Lisa Simpson', ratios: {top: 0.39, bottom: 1}},
                    {name: 'Barney', ratios: {top: 0.22, bottom: 0.78}},
                    {name: 'Sideshow Bob', ratios: {top: 0.13, bottom: 0.87}},
                    {name: 'Ned Flanders', ratios: {top: 0.49, bottom: 0.51}},
                    {name: 'Milhouse', ratios: {top: 0.69, bottom: 0.31}},
                    {name: 'Apu', ratios: {top: 0.89, bottom: 0.11}},
                    {name: 'Moe', ratios: {top: 0.64, bottom: 0.36}},
                    {name: 'Smithers', ratios: {top: 0.09, bottom: 0.91}},
                    {name: 'Edna Krabappel', ratios: {top: 0.39, bottom: 0.61}},
                    {name: 'Krusty', ratios: {top: 0.74, bottom: 0.26}}
                ];
            },
            createColumnDefs() {
                this.columnDefs = [
                    {
                        headerName: "Name",
                        field: "name",
                        width: 200,
                        headerComponentFramework: SimpsonsHeaderComponent,
                        headerComponentParams : {
                            menuIcon: 'fa-bars'
                        }
                    },
                    {
                        headerName: "Ratio Component",
                        field: "ratios",
                        cellRendererFramework: RatioParentComponent,
                        width: 350
                    },
                    {
                        headerName: "Clickable Component",
                        field: "name",
                        cellRendererFramework: ClickableParentComponent,
                        width: 250
                    }
                ];
            }
        },
        beforeMount() {
            this.gridOptions = {};
            this.createRowData();
            this.createColumnDefs();
        }
    }
</script>


