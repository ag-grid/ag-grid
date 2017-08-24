<template>
    <div style="width: 800px;">
        <h1>Master/Detail Component</h1>
        <ag-grid-vue style="width: 100%; height: 350px;" class="ag-fresh"
                     :gridOptions="gridOptions"
                     :isFullWidthCell="isFullWidthCell"
                     :getRowHeight="getRowHeight"
                     :getNodeChildDetails="getNodeChildDetails"
                     :fullWidthCellRendererFramework="getFullWidthCellRenderer()"

                     :enableSorting="true"
                     :enableColResize="true"
                     :suppressMenuFilterPanel="true">
        </ag-grid-vue>
    </div>
</template>

<script>
    import Vue from "vue";
    import {AgGridVue} from "ag-grid-vue";
    import DetailPanelComponent from './DetailPanelComponent.vue'

    // a list of names we pick from when generating data
    const FIRST_NAMES = ['Sophia', 'Emma', 'Olivia', 'Isabella', 'Mia', 'Ava', 'Lily', 'Zoe', 'Emily', 'Chloe', 'Layla',
        'Madison', 'Madelyn', 'Abigail', 'Aubrey', 'Charlotte', 'Amelia', 'Ella', 'Kaylee', 'Avery', 'Aaliyah', 'Hailey',
        'Hannah', 'Addison', 'Riley', 'Harper', 'Aria', 'Arianna', 'Mackenzie', 'Lila', 'Evelyn', 'Adalyn', 'Grace',
        'Brooklyn', 'Ellie', 'Anna', 'Kaitlyn', 'Isabelle', 'Sophie', 'Scarlett', 'Natalie', 'Leah', 'Sarah', 'Nora',
        'Mila', 'Elizabeth', 'Lillian', 'Kylie', 'Audrey', 'Lucy', 'Maya'];
    const LAST_NAMES = ['Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans', 'Wilson', 'Thomas', 'Johnson'];

    const IMAGES = ['niall', 'sean', 'alberto', 'statue', 'horse'];

    // each call gets a unique id, nothing to do with the grid, just help make the sample
    // data more realistic
    let callIdSequence = 555;

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

                for (let i = 0; i < 20; i++) {
                    let firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
                    let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];

                    let image = IMAGES[i % IMAGES.length];

                    let totalDuration = 0;

                    let callRecords = [];
                    // call count is random number between 20 and 120
                    let callCount = Math.floor(Math.random() * 100) + 20;
                    for (let j = 0; j < callCount; j++) {
                        // duration is random number between 20 and 120
                        let callDuration = Math.floor(Math.random() * 100) + 20;
                        let callRecord = {
                            callId: callIdSequence++,
                            duration: callDuration,
                            switchCode: 'SW' + Math.floor(Math.random() * 10),
                            // 50% chance of in vs out
                            direction: (Math.random() > .5) ? 'In' : 'Out',
                            // made up number
                            number: '(0' + Math.floor(Math.random() * 10) + ') ' + Math.floor(Math.random() * 100000000)
                        };
                        callRecords.push(callRecord);
                        totalDuration += callDuration;
                    }

                    let record = {
                        name: firstName + ' ' + lastName,
                        account: i + 177000,
                        totalCalls: callCount,
                        image: image,
                        // convert from seconds to minutes
                        totalMinutes: totalDuration / 60,
                        callRecords: callRecords
                    };
                    rowData.push(record);
                }

                return rowData;
            },
            createColumnDefs() {
                return [
                    {
                        headerName: 'Name', field: 'name',
                        // left column is going to act as group column, with the expand / contract controls
                        cellRenderer: 'group',
                        // we don't want the child count - it would be one each time anyway as each parent
                        // not has exactly one child node
                        cellRendererParams: {suppressCount: true}
                    },
                    {headerName: 'Account', field: 'account'},
                    {headerName: 'Calls', field: 'totalCalls'},
                    {headerName: 'Minutes', field: 'totalMinutes', cellFormatter: this.minuteCellFormatter}
                ];
            },
            minuteCellFormatter(params) {
                return params.value.toLocaleString() + 'm';
            },
            isFullWidthCell(rowNode) {
                return rowNode.level === 1;
            },
            getFullWidthCellRenderer() {
                return DetailPanelComponent;
            },
            getRowHeight(params) {
                let rowIsDetailRow = params.node.level === 1;
                // return 100 when detail row, otherwise return 25
                return rowIsDetailRow ? 200 : 25;
            },
            getNodeChildDetails(record) {
                if (record.callRecords) {
                    return {
                        group: true,
                        // the key is used by the default group cellRenderer
                        key: record.name,
                        // provide ag-Grid with the children of this group
                        children: [record.callRecords],
                        // for demo, expand the third row by default
                        expanded: record.account === 177002
                    };
                } else {
                    return null;
                }
            }
        },
        beforeMount() {
            this.gridOptions = {};
            this.gridOptions.rowData = this.createRowData();
            this.gridOptions.columnDefs = this.createColumnDefs();
        },
        mounted() {
            this.gridOptions.api.sizeColumnsToFit();
        }
    }
</script>

