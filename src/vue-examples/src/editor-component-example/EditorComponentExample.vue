<template>
    <div style="width: 800px;">
        <h1>Editor Components</h1>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-fresh"
                     :gridOptions="gridOptions">
        </ag-grid-vue>
    </div>
</template>

<script>
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import MoodRendererComponent from './MoodRendererComponent'
    import MoodEditorComponent from './MoodEditorComponent.vue'
    import NumericEditorComponent from './NumericEditorComponent'

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
                    {name: "Bob", mood: "Happy", number: 10},
                    {name: "Harry", mood: "Sad", number: 3},
                    {name: "Sally", mood: "Happy", number: 20},
                    {name: "Mary", mood: "Sad", number: 5},
                    {name: "John", mood: "Happy", number: 15},
                    {name: "Jack", mood: "Happy", number: 25},
                    {name: "Sue", mood: "Sad", number: 43},
                    {name: "Sean", mood: "Sad", number: 1335},
                    {name: "Niall", mood: "Happy", number: 2},
                    {name: "Alberto", mood: "Happy", number: 123},
                    {name: "Fred", mood: "Sad", number: 532},
                    {name: "Jenny", mood: "Happy", number: 34},
                    {name: "Larry", mood: "Happy", number: 13},
                ];
            },
            createColumnDefs() {
                return [
                    {headerName: "Name", field: "name", width: 300},
                    {
                        headerName: "Mood",
                        field: "mood",
                        cellRendererFramework: MoodRendererComponent,
                        cellEditorFramework: MoodEditorComponent,
                        editable: true,
                        width: 250
                    },
                    {
                        headerName: "Numeric",
                        field: "number",
                        cellEditorFramework: NumericEditorComponent,
                        editable: true,
                        width: 250
                    }
                ]
            }
        },
        beforeMount() {
            this.gridOptions = {};
            this.gridOptions.rowData = this.createRowData();
            this.gridOptions.columnDefs = this.createColumnDefs();
        }
    }
</script>

