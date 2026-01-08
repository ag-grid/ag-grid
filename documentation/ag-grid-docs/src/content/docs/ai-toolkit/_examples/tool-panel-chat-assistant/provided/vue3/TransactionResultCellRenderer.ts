import { computed, defineComponent, ref } from 'vue';

import { ICellRendererParams } from 'ag-grid-community';

export const TransactionResultCellRenderer = defineComponent({
    props: {
        params: {
            type: Object as () => ICellRendererParams,
            required: true,
        },
    },
    setup(props) {
        const value = ref(props.params.value || '');

        const iconUrl = computed(() => {
            const iconName = value.value === 'Completed' ? 'tick-in-circle' : 'cross-in-circle';
            return `https://www.ag-grid.com/example-assets/icons/${iconName}.png`;
        });

        return {
            value,
            iconUrl,
        };
    },
    template: `
        <span style="display: flex; justify-content: center; height: 100%; align-items: center">
            <img :src="iconUrl" style="width: auto; height: auto" :alt="value" />
        </span>
    `,
});
