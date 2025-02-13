export default {
    template: `<span>
        <template v-for="part in parts">
            <mark v-if="part.match" :class="['ag-find-match', part.activeMatch ? 'ag-find-active-match' : '']">{{ part.value }}</mark>
            <template v-if="!part.match">{{ part.value }}</template>
        </template>
      </span>`,
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
            const { api, value, valueFormatted, column, node } = params;
            const cellValue = valueFormatted ?? value?.toString();
            if (cellValue == null || cellValue === '') {
                this.parts = [];
                return;
            }
            const cellDisplayValue = `Year is ${cellValue}`;
            const parts =
                column != null
                    ? api.findGetParts({
                          value: cellDisplayValue,
                          node,
                          column,
                      })
                    : [];
            this.parts = parts.length ? parts : [{ value: cellDisplayValue }];
        },
    },
};
