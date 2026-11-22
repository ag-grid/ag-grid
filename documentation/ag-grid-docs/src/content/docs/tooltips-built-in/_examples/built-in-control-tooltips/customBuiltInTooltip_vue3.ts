import type { PropType } from 'vue';
import { defineComponent } from 'vue';

import type { IBuiltInTooltipParams } from 'ag-grid-community';

export default defineComponent({
    props: {
        params: {
            type: Object as PropType<IBuiltInTooltipParams & { heading: string }>,
            required: true,
        },
    },
    template: `
        <div class="control-tooltip">
            <span>{{ params.heading }}</span>
            <strong>{{ params.text }}</strong>
            <small>{{ params.location }} / {{ params.control }}</small>
        </div>
    `,
});
