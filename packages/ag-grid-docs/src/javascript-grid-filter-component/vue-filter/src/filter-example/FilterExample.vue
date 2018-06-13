<template>
    <div style="width: 760px;">
        <button style="margin-bottom: 10px" @click="onClicked()">Filter Instance Method</button>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-theme-balham"
                     :gridOptions="gridOptions">
        </ag-grid-vue>
    </div>
</template>

<script>
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import PartialMatchFilterComponent from './PartialMatchFilterComponent'

    export default {
        data() {
            return {
                gridOptions: null,
                text: null
            }
        },
        components: {
            'ag-grid-vue': AgGridVue
        },
        methods: {
            createRowData() {
                return [
                    {"row": "Row 1", "name": "Michael Phelps"},
                    {"row": "Row 2", "name": "Natalie Coughlin"},
                    {"row": "Row 3", "name": "Aleksey Nemov"},
                    {"row": "Row 4", "name": "Alicia Coutts"},
                    {"row": "Row 5", "name": "Missy Franklin"},
                    {"row": "Row 6", "name": "Ryan Lochte"},
                    {"row": "Row 7", "name": "Allison Schmitt"},
                    {"row": "Row 8", "name": "Natalie Coughlin"},
                    {"row": "Row 9", "name": "Ian Thorpe"},
                    {"row": "Row 10", "name": "Bob Mill"},
                    {"row": "Row 11", "name": "Willy Walsh"},
                    {"row": "Row 12", "name": "Sarah McCoy"},
                    {"row": "Row 13", "name": "Jane Jack"},
                    {"row": "Row 14", "name": "Tina Wills"}
                ];
            },
            createColumnDefs() {
                return [
                    {headerName: "Row", field: "row", width: 450},
                    {
                        headerName: "Filter Component",
                        field: "name",
                        filterFramework: PartialMatchFilterComponent,
                        width: 430
                    }
                ];
            },
            onClicked() {
                this.gridOptions.api.getFilterInstance("name").getFrameworkComponentInstance().componentMethod("Hello World!");
            }
        },
        beforeMount() {
            this.gridOptions = {
                enableFilter: true,
                rowData: this.createRowData(),
                columnDefs: this.createColumnDefs(),
                defaultColDef: {
                    menuTabs: ['filterMenuTab']
                }
            };
        }
    }
</script>

<style>
</style>
