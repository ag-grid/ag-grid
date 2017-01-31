<template>
    <div style="width: 800px;">
        <h1>Dynamic Components</h1>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-fresh"
                     :gridOptions="gridOptions"
                     :columnDefs="columnDefs"
                     :rowData="rowData"
                     :showToolPanel="showToolPanel"

                     :enableColResize="true"
                     :enableSorting="true"
                     :enableFilter="true"
                     :groupHeaders="true"
                     :suppressRowClickSelection="true"
                     :toolPanelSuppressGroups="true"
                     :toolPanelSuppressValues="true"
                     rowHeight="22"
                     rowSelection="multiple"

                     :modelUpdated="onModelUpdated"
                     :cellClicked="onCellClicked"
                     :cellDoubleClicked="onCellDoubleClicked"
                     :cellContextMenu="onCellContextMenu"
                     :cellValueChanged="onCellValueChanged"
                     :cellFocused="onCellFocused"
                     :rowSelected="onRowSelected"
                     :selectionChanged="onSelectionChanged"
                     :beforeFilterChanged="onBeforeFilterChanged"
                     :afterFilterChanged="onAfterFilterChanged"
                     :filterModified="onFilterModified"
                     :beforeSortChanged="onBeforeSortChanged"
                     :afterSortChanged="onAfterSortChanged"
                     :virtualRowRemoved="onVirtualRowRemoved"
                     :rowClicked="onRowClicked"
                     :gridReady="onReady"

                     :columnEverythingChanged="onColumnEvent"
                     :columnRowGroupChanged="onColumnEvent"
                     :columnValueChanged="onColumnEvent"
                     :columnMoved="onColumnEvent"
                     :columnVisible="onColumnEvent"
                     :columnGroupOpened="onColumnEvent"
                     :columnResized="onColumnEvent"
                     :columnPinnedCountChanged="onColumnEvent">
        </ag-grid-vue>
    </div>
</template>
<!--:debug="true"-->

<script>
    import Vue from "vue";
    import agGridComponent from '../agGridVue.vue'
    import CurrencyComponent from './CurrencyComponent'

    let SquareComponent = Vue.extend({
        template: '<span>{{ valueSquared() }}</span>',
        methods: {
            valueSquared() {
                return this.params.value * this.params.value;
            }
        }
    });

    export default {
        data () {
            return {
                gridOptions: null,
                columnDefs: null,
                rowData: null,
                showGrid: false,
                showToolPanel: false,
                rowCount: null
            }
        },
        components: {
            'ag-grid-vue': agGridComponent,
            'CubeComponent': {
                template: '<span>{{ valueCubed() }}</span>',
                methods: {
                    valueCubed() {
                        return this.params.value * this.params.value * this.params.value;
                    }
                }
            },
            ParamsComponent: {
                template: '<span>Field: {{params.colDef.field}}, Value: {{params.value}}</span>',
                methods: {
                    valueCubed() {
                        return this.params.value * this.params.value * this.params.value;
                    }
                }
            }
        },
        methods: {
            createRowData() {
                const rowData = [];

                for (let i = 0; i < 15; i++) {
                    rowData.push({
                        row: "Row " + i,
                        value: i,
                        currency: i + Number(Math.random().toFixed(2))
                    });
                }

                this.rowData = rowData;
            },
            createColumnDefs() {
                this.columnDefs = [
                    {headerName: "Row", field: "row", width: 140},
                    {
                        headerName: "Square",
                        field: "value",
                        cellRendererFramework: SquareComponent,
                        editable: true,
                        colId: "square",
                        width: 125
                    },
                    {
                        headerName: "Cube",
                        field: "value",
                        cellRendererFramework: 'CubeComponent',
                        colId: "cube",
                        width: 125
                    },
                    {
                        headerName: "Row Params",
                        field: "row",
                        cellRendererFramework: 'ParamsComponent',
                        colId: "params",
                        width: 245
                    },
                    {
                        headerName: "Currency (Filter)",
                        field: "currency",
                        cellRendererFramework: CurrencyComponent,
                        colId: "params",
                        width: 150
                    }
                ];
            },
            calculateRowCount() {
                if (this.gridOptions.api && this.rowData) {
                    let model = this.gridOptions.api.getModel();
                    let totalRows = this.rowData.length;
                    let processedRows = model.getRowCount();
                    this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
                }
            },

            onModelUpdated() {
                console.log('onModelUpdated');
                this.calculateRowCount();
            },

            onReady() {
                console.log('onReady');
                this.calculateRowCount();
            },

            onCellClicked(event) {
                console.log('onCellClicked: ' + event.rowIndex + ' ' + event.colDef.field);
            },

            onCellValueChanged(event) {
                console.log('onCellValueChanged: ' + event.oldValue + ' to ' + event.newValue);
            },

            onCellDoubleClicked(event) {
                console.log('onCellDoubleClicked: ' + event.rowIndex + ' ' + event.colDef.field);
            },

            onCellContextMenu(event) {
                console.log('onCellContextMenu: ' + event.rowIndex + ' ' + event.colDef.field);
            },

            onCellFocused(event) {
                console.log('onCellFocused: (' + event.rowIndex + ',' + event.colIndex + ')');
            },

            // taking out, as when we 'select all', it prints to much to the console!!
            onRowSelected(event) {
                console.log('onRowSelected: ' + event.node.data.name);
            },

            onSelectionChanged() {
                console.log('selectionChanged');
            },

            onBeforeFilterChanged() {
                console.log('beforeFilterChanged');
            },

            onAfterFilterChanged() {
                console.log('afterFilterChanged');
            },

            onFilterModified() {
                console.log('onFilterModified');
            },

            onBeforeSortChanged() {
                console.log('onBeforeSortChanged');
            },

            onAfterSortChanged() {
                console.log('onAfterSortChanged');
            },

            onVirtualRowRemoved(event) {
                // because this event gets fired LOTS of times, we don't print it to the
                // console. if you want to see it, just uncomment out this line
                // console.log('onVirtualRowRemoved: ' + event.rowIndex);
            },

            onRowClicked(event) {
                console.log('onRowClicked: ' + event.node.data.name);
            },

            onQuickFilterChanged(event) {
                this.gridOptions.api.setQuickFilter(event.target.value);
            },

            // here we use one generic event to handle all the column type events.
            // the method just prints the event name
            onColumnEvent(event) {
                console.log('onColumnEvent: ' + event);
            }
        },
        beforeMount() {
            this.gridOptions = {};
            this.createRowData();
            this.createColumnDefs();
            this.showGrid = true;
        }
    }

    function skillsCellRenderer(params) {
        let data = params.data;
        let skills = [];
        RefData.IT_SKILLS.forEach(function (skill) {
            if (data && data.skills && data.skills[skill]) {
                skills.push('<img src="images/skills/' + skill + '.png" width="16px" title="' + skill + '" />');
            }
        });
        return skills.join(' ');
    }

    function countryCellRenderer(params) {
        let flag = "<img border='0' width='15' height='10' style='margin-bottom: 2px' src='images/flags/" + RefData.COUNTRY_CODES[params.value] + ".png'>";
        return flag + " " + params.value;
    }

    function createRandomPhoneNumber() {
        let result = '+';
        for (let i = 0; i < 12; i++) {
            result += Math.round(Math.random() * 10);
            if (i === 2 || i === 5 || i === 8) {
                result += ' ';
            }
        }
        return result;
    }

    function percentCellRenderer(params) {
        let value = params.value;

        let eDivPercentBar = document.createElement('div');
        eDivPercentBar.className = 'div-percent-bar';
        eDivPercentBar.style.width = value + '%';
        if (value < 20) {
            eDivPercentBar.style.backgroundColor = 'red';
        } else if (value < 60) {
            eDivPercentBar.style.backgroundColor = '#ff9900';
        } else {
            eDivPercentBar.style.backgroundColor = '#00A000';
        }

        let eValue = document.createElement('div');
        eValue.className = 'div-percent-value';
        eValue.innerHTML = value + '%';

        let eOuterDiv = document.createElement('div');
        eOuterDiv.className = 'div-outer-div';
        eOuterDiv.appendChild(eValue);
        eOuterDiv.appendChild(eDivPercentBar);

        return eOuterDiv;
    }

</script>

<style>
    .ag-cell {
        padding-top: 2px !important;
        padding-bottom: 2px !important;
    }

    label {
        font-weight: normal !important;
    }

    .div-percent-bar {
        display: inline-block;
        height: 100%;
        position: relative;
        z-index: 0;
    }

    .div-percent-value {
        position: absolute;
        padding-left: 4px;
        font-weight: bold;
        font-size: 13px;
        z-index: 100;
    }

    .div-outer-div {
        display: inline-block;
        height: 100%;
        width: 100%;
    }
</style>
