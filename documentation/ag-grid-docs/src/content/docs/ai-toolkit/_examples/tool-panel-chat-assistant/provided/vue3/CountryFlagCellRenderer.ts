import { computed, defineComponent, ref } from 'vue';

import { ICellRendererParams } from 'ag-grid-community';

export const CountryFlagCellRenderer = defineComponent({
    props: {
        params: {
            type: Object as () => ICellRendererParams,
            required: true,
        },
    },
    setup(props) {
        const value = ref(props.params.value || '');

        const flagUrl = computed(() => {
            if (!value.value) return '';
            const countryCode = value.value.toLowerCase();
            return `https://flags.fmcdn.net/data/flags/mini/${countryCode}.png`;
        });

        return {
            value,
            flagUrl,
        };
    },
    template: `
        <div v-if="value" style="display: flex; align-items: center; gap: 6px">
            <img :src="flagUrl" width="15" height="10" style="border: 0" :alt="value" />
            <span>{{ value }}</span>
        </div>
    `,
});
