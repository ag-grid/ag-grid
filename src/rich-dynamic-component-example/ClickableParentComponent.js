import Vue from "vue";
import ClickableComponent from "./ClickableComponent";

export default Vue.extend({
    template: '<ag-clickable :onClicked="onClicked" :cell="cell"></ag-clickable>',
    data() {
        return {
            cell: null
        }
    },
    methods: {
        onClicked(cell) {
            console.log("Child Cell Clicked: " + JSON.stringify(cell));
        }
    },
    components: {
        'ag-clickable': ClickableComponent
    },
    created() {
        this.cell = {row: this.params.value, col: this.params.colDef.headerName};
    }
});

