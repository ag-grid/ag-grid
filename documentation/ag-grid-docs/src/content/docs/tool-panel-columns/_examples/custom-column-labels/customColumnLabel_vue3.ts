export default {
    template: `
        <span
            class="custom-column-label"
            :data-kind="params.columnGroup ? 'group' : 'column'"
            :data-source="params.source"
        >
            <span class="custom-column-label-icon">
                {{ params.columnGroup ? params.columnGroupIcon : params.columnIcon }}
            </span>
            <span class="custom-column-label-text">{{ params.displayName }}</span>
        </span>
    `,
};
