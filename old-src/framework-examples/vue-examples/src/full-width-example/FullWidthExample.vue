<template>
    <div style="width: 800px;">
        <h1>Full Width Component</h1>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-theme-fresh"
                     :gridOptions="gridOptions">
        </ag-grid-vue>
    </div>
</template>

<script>
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import NameAndAgeRendererComponent from './NameAndAgeRendererComponent'

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
                return [
                    {name: "Bob", age: 10},
                    {name: "Harry", age: 3},
                    {name: "Sally", age: 20},
                    {name: "Mary", age: 5},
                    {name: "John", age: 15},
                    {name: "Bob", age: 10},
                    {name: "Harry", age: 3},
                    {name: "Sally", age: 20},
                    {name: "Mary", age: 5},
                    {name: "John", age: 15},
                    {name: "Jack", age: 25},
                    {name: "Sue", age: 43},
                    {name: "Sean", age: 44},
                    {name: "Niall", age: 2},
                    {name: "Alberto", age: 32},
                    {name: "Fred", age: 53},
                    {name: "Jenny", age: 34},
                    {name: "Larry", age: 13},
                ];
            },
            createColumnDefs() {
                return [
                    {
                        headerName: "Name",
                        field: "name",
                        width: 400
                    },
                    {
                        headerName: "Age",
                        field: "age",
                        width: 399
                    },
                ];
            }
        },
        beforeMount() {
            this.gridOptions = {};
            this.gridOptions.rowData = this.createRowData();
            this.gridOptions.columnDefs = this.createColumnDefs();
            this.gridOptions.isFullWidthCell = (rowNode)=> {
                return (rowNode.id === "0") || (parseInt(rowNode.id) % 2 === 0);
            };
            this.gridOptions.fullWidthCellRendererFramework = NameAndAgeRendererComponent;
        }
    }
</script>

<style>
</style>
