export default {
    template: `<div role="gridcell">
        <h1 style="padding: 20px;">
            <template v-for="part in parts">
                <mark v-if="part.match" :class="['ag-find-match', part.activeMatch ? 'ag-find-active-match' : '']">{{ part.value }}</mark>
                <template v-if="!part.match">{{ part.value }}</template>
            </template>
        </h1>
    </div>`,
    data: function () {
        return {
            parts: [],
        };
    },
    beforeMount() {
        this.updateDisplay(this.params);
    },
    methods: {
        refresh(params) {
            this.updateDisplay(params);
            return true;
        },
        updateDisplay(params) {
            const { api, node } = params;
            const cellDisplayValue = 'My Custom Detail';
            const parts = api.findGetParts({
                value: cellDisplayValue,
                node,
                column: null,
            });
            this.parts = parts.length ? parts : [{ value: cellDisplayValue }];
        },
    },
};
