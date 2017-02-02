import Vue from "vue";
import agGridComponent from "../agGridVue.vue";

export default Vue.extend({
    template: `
        <div class="full-width-panel">
            <div class="full-width-details">
                <div class="full-width-detail"><img width="120px" :src="parentRecordImage"/></div>
                <div class="full-width-detail"><b>Name: </b> {{parentRecord.name}}</div>
                <div class="full-width-detail"><b>Account: </b> {{parentRecord.account}}</div>
            </div>
            <ag-grid-vue :ref="'detail'" class="full-width-grid"
                         :gridOptions="gridOptions"
        
                         :enableSorting="true"
                         :enableFilter="true"
                         :enableColResize="true">        
            </ag-grid-vue>
            <div class="full-width-grid-toolbar">
                <img class="full-width-phone-icon" src="../images/phone.png"/>
                <button @click="onButtonClick()"><img src="../images/fire.png"/></button>
                <button @click="onButtonClick()"><img src="../images/frost.png"/></button>
                <button @click="onButtonClick()"><img src="../images/sun.png"/></button>
                <input class="full-width-search" :ref="'box'" @keyup="onSearchTextChange(box.value)" placeholder="Search..."/>
            </div>
        </div>`,
    data() {
        return {
            gridOptions: null,
            parentRecord: null,
            parentRecordImage: null
        }
    },
    components: {
        'ag-grid-vue': agGridComponent
    },
    methods: {
        createColumnDefs() {
            return [
                {headerName: 'Call ID', field: 'callId', cellClass: 'call-record-cell'},
                {headerName: 'Direction', field: 'direction', cellClass: 'call-record-cell'},
                {headerName: 'Number', field: 'number', cellClass: 'call-record-cell'},
                {
                    headerName: 'Duration',
                    field: 'duration',
                    cellClass: 'call-record-cell',
                    cellFormatter: this.secondCellFormatter
                },
                {headerName: 'Switch', field: 'switchCode', cellClass: 'call-record-cell'}
            ];
        },
        secondCellFormatter(params) {
            return params.value.toLocaleString() + 's';
        },
        consumeMouseWheelOnDetailGrid($event) {
            $event.stopPropagation();
        },
        onButtonClick() {
            window.alert('Sample button pressed!!');
        },
        onSearchTextChange(newData) {
            this.gridOptions.api.setQuickFilter(newData);
        }
    },
    beforeMount() {
        this.gridOptions = {};
        this.gridOptions.columnDefs = this.createColumnDefs();
    },
    created() {
        this.parentRecord = this.params.node.parent.data;
        this.parentRecordImage = `../images/${this.parentRecord.image}.png`;
    },
    mounted() {
        this.gridOptions.api.setRowData(this.parentRecord.callRecords);
        this.gridOptions.api.sizeColumnsToFit();

        // if we don't do this, then the mouse wheel will be picked up by the main
        // grid and scroll the main grid and not this component. this ensures that
        // the wheel move is only picked up by the text field
        this.$refs.detail.$el.addEventListener('mousewheel', this.consumeMouseWheelOnDetailGrid)
    },
    destroyed() {
        console.log("destroyed");
        this.$refs.detail.$el.removeEventListener('mousewheel', this.consumeMouseWheelOnDetailGrid)
    }
})


