<template>
    <div style="width: 800px;">
        <h1>Pinned Row Component</h1>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-theme-fresh"
                     :gridOptions="gridOptions">
        </ag-grid-vue>
    </div>
</template>

<script>
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import StyledRendererComponent from './StyledRendererComponent'

    export default {
        data () {
            return {
                gridOptions: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        methods: {
            createRowData() {
                let rowData = [];

                for (let i = 0; i < 15; i++) {
                    rowData.push({
                        row: "Row " + i,
                        number: Math.round(Math.random() * 100)
                    });
                }

                return rowData;
            },
            createColumnDefs() {
                return [
                    {
                        headerName: "Row",
                        field: "row",
                        width: 400,
                        floatingCellRendererFramework: StyledRendererComponent,
                        floatingCellRendererParams: {
                            style: {'font-weight': 'bold'}
                        }
                    },
                    {
                        headerName: "Number",
                        field: "number",
                        width: 399,
                        floatingCellRendererFramework: StyledRendererComponent,
                        floatingCellRendererParams: {
                            style: {'font-style': 'italic'}
                        }
                    },
                ];
            }
        },
        beforeMount() {
            this.gridOptions = {};
            this.gridOptions.rowData = this.createRowData();
            this.gridOptions.columnDefs = this.createColumnDefs();
            this.gridOptions.pinnedTopRowData = [
                {row: "Top Row", number: "Top Number"}
            ];
            this.gridOptions.pinnedBottomRowData = [
                {row: "Bottom Row", number: "Bottom Number"}
            ];
        }
    }
</script>

<style>
</style>
