export default {
    template: `
        <div class="ag-toolbar-item">
            <button class="ag-button ag-standard-button" @click="onClick">
                {{ active ? 'Clear Analysis' : 'Analyse by Country' }}
            </button>
        </div>
    `,
    data() {
        return {
            active: false,
        };
    },
    methods: {
        onClick() {
            const { api } = this.params;
            this.active = !this.active;

            if (this.active) {
                api.setRowGroupColumns(['country']);
                api.setFilterModel({ year: { filterType: 'number', type: 'equals', filter: 2008 } });
            } else {
                api.setRowGroupColumns([]);
                api.setFilterModel(null);
            }
        },
    },
};
