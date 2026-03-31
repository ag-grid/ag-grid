export default {
    template: `
        <div class="ag-toolbar-item">
            <button class="ag-button ag-standard-button" v-on:click="onClick">Log Selected Rows</button>
        </div>
    `,
    methods: {
        onClick() {
            const selectedRows = this.params.api.getSelectedRows();
            console.log('Selected Rows:', selectedRows.length);
        },
    },
};
